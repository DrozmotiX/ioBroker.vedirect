'use strict';

const utils = require('@iobroker/adapter-core');
const { VeDirectCom } = require('./lib/veDirectCom');
const { VE_DIRECT_FIELDS } = require('./lib/veDirect/fields');

const WATCHDOG_INTERVAL_MS = 1000;
const DATA_TIMEOUT_MS = 10000;
const RECONNECT_COOLDOWN_MS = 5000;
const ERROR_LOG_COOLDOWN_MS = 60000;
const UNLOAD_DRAIN_TIMEOUT_MS = 5000;

class Vedirect extends utils.Adapter {
    constructor(options = {}) {
        super({ ...options, name: 'vedirect' });
        this.com = new VeDirectCom();
        this.serialPortPath = '';
        this.expireSeconds = 0;
        this.samplingSeconds = 0;
        this.lastFrameTime = 0;
        this.lastOpenAttempt = 0;
        this.watchDogInterval = undefined;
        this.activeWatchDog = undefined;
        this.readyPromise = undefined;
        this.unloadPromise = undefined;
        this.unloaded = false;
        this.frameQueue = Promise.resolve();
        this.pendingSample = null;
        this.sampleTimer = undefined;
        this.unloadTimeoutMs = UNLOAD_DRAIN_TIMEOUT_MS;
        this.connectionState = undefined;
        this.connectionRequested = undefined;
        this.stateQueues = new Map();
        this.objectPromises = new Map();
        this.lastSerialError = '';
        this.lastSerialErrorTime = 0;
        this.on('ready', this.handleReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    handleReady() {
        if (this.readyPromise) {
            return;
        }
        const operation = this.onReady().catch(async error => {
            this.log.error(`Could not initialize VE.Direct adapter: ${this.errorText(error)}`);
            await this.safeSetConnectionState(false);
        });
        this.readyPromise = operation;
        void operation.catch(error => this.log.error(`VE.Direct ready handler failed: ${this.errorText(error)}`));
    }

    async onReady() {
        if (this.unloaded) {
            return;
        }
        await this.initConnectionObject();
        if (this.unloaded) {
            return;
        }
        await this.safeSetConnectionState(false);
        if (this.unloaded) {
            return;
        }

        this.expireSeconds = this.nonNegativeConfig(this.config.expireTime, 'expireTime');
        this.samplingSeconds = this.nonNegativeConfig(this.config.messageBuffer, 'messageBuffer');
        this.serialPortPath = String(this.config.USBDevice || '').trim();
        if (!this.serialPortPath || this.serialPortPath === '/dev/xxx') {
            this.log.error('Configure a valid VE.Direct serial port before starting the adapter');
            return;
        }

        this.com.onValidFrame = () => {
            this.lastFrameTime = Date.now();
            void this.safeSetConnectionState(true);
        };
        this.com.onFrame = frame => this.acceptFrame(frame);
        this.com.onError = error => this.logSerialError(error);
        if (this.unloaded) {
            return;
        }
        void this.watchDog();
        this.watchDogInterval = setInterval(() => void this.watchDog(), WATCHDOG_INTERVAL_MS);
    }

    async initConnectionObject() {
        /** @type {ioBroker.StateCommon} */
        const common = {
            name: 'Fresh checksum-valid VE.Direct frame received',
            type: 'boolean',
            role: 'indicator.connected',
            read: true,
            write: false,
            def: false,
        };
        await this.setObjectNotExistsAsync('info.connection', { type: 'state', common, native: {} });
        if (this.unloaded) {
            return;
        }
        await this.extendObjectAsync('info.connection', { common });
    }

    nonNegativeConfig(value, name) {
        if (value == null || value === '') {
            return 0;
        }
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) {
            throw new Error(`${name} must be a finite non-negative number`);
        }
        return number;
    }

    isFresh() {
        return this.lastFrameTime > 0 && Date.now() - this.lastFrameTime < DATA_TIMEOUT_MS;
    }

    watchDog() {
        if (this.activeWatchDog) {
            return this.activeWatchDog;
        }
        const operation = this.performWatchDog();
        this.activeWatchDog = operation;
        const clear = () => {
            if (this.activeWatchDog === operation) {
                this.activeWatchDog = undefined;
            }
        };
        void operation.then(clear, clear);
        return operation;
    }

    async performWatchDog() {
        if (this.unloaded || !this.serialPortPath) {
            return;
        }
        if (this.isFresh()) {
            return;
        }
        await this.safeSetConnectionState(false);
        if (this.unloaded || this.isFresh()) {
            return;
        }
        const now = Date.now();
        if (now - this.lastOpenAttempt < RECONNECT_COOLDOWN_MS) {
            return;
        }
        this.lastOpenAttempt = now;
        try {
            if (this.com.isOpen()) {
                await this.com.close();
                if (this.unloaded) {
                    return;
                }
            }
            if (this.unloaded) {
                return;
            }
            await this.com.open(this.serialPortPath);
        } catch (error) {
            if (!this.unloaded) {
                this.log.error(`Could not open/reopen VE.Direct port: ${this.errorText(error)}`);
                await this.safeSetConnectionState(false);
            }
        }
    }

    acceptFrame(frame) {
        if (this.unloaded) {
            return;
        }
        const snapshot = { ...frame };
        if (this.samplingSeconds === 0) {
            this.enqueueFrame(snapshot);
            return;
        }
        this.pendingSample = { ...(this.pendingSample || {}), ...snapshot };
        if (this.sampleTimer) {
            return;
        }
        this.sampleTimer = setTimeout(() => {
            this.sampleTimer = undefined;
            const pending = this.pendingSample;
            this.pendingSample = null;
            if (pending && !this.unloaded) {
                this.enqueueFrame(pending);
            }
        }, this.samplingSeconds * 1000);
    }

    enqueueFrame(frame) {
        if (this.unloaded) {
            return;
        }
        const snapshot = { ...frame };
        const operation = this.frameQueue.then(() => this.publishFrame(snapshot));
        this.frameQueue = operation.catch(error =>
            this.log.error(`Could not process VE.Direct frame: ${this.errorText(error)}`),
        );
    }

    clearPendingSample() {
        if (this.sampleTimer) {
            clearTimeout(this.sampleTimer);
            this.sampleTimer = undefined;
        }
        this.pendingSample = null;
    }

    async publishFrame(frame) {
        if (this.unloaded || this.connectionRequested === false) {
            return;
        }
        for (const [key, value] of Object.entries(frame)) {
            if (this.unloaded || this.connectionRequested === false) {
                return;
            }
            const field = VE_DIRECT_FIELDS[key];
            if (!field) {
                continue;
            }
            try {
                await this.ensureStateObject(field);
                if (this.unloaded) {
                    return;
                }
                await this.writeState(key, value, field);
            } catch (error) {
                this.log.error(`Could not publish ${key}: ${this.errorText(error)}`);
            }
        }
    }

    ensureStateObject(field) {
        const existing = this.objectPromises.get(field.id);
        if (existing) {
            return existing;
        }
        const operation = (async () => {
            /** @type {ioBroker.StateCommon} */
            const common = {
                name: field.label,
                type: field.type,
                role: field.role,
                read: true,
                write: false,
                unit: field.unit,
                desc: field.descr,
            };
            await this.setObjectNotExistsAsync(field.id, { type: 'state', common, native: {} });
            if (this.unloaded) {
                return;
            }
            await this.extendObjectAsync(field.id, { common });
        })();
        this.objectPromises.set(field.id, operation);
        void operation.catch(() => this.objectPromises.delete(field.id));
        return operation;
    }

    writeState(key, value, field) {
        const previous = this.stateQueues.get(key) || Promise.resolve();
        const result = previous
            .catch(() => undefined)
            .then(async () => {
                if (field && this.expireSeconds > 0 && field.expire) {
                    await this.setStateAsync(key, { val: value, ack: true, expire: this.expireSeconds });
                } else if (field) {
                    await this.setStateChangedAsync(key, { val: value, ack: true });
                } else {
                    await this.setStateAsync(key, { val: value, ack: true });
                }
            })
            .then(() => undefined);
        const tracked = result.then(
            () => undefined,
            () => undefined,
        );
        this.stateQueues.set(key, tracked);
        void tracked.then(() => {
            if (this.stateQueues.get(key) === tracked) {
                this.stateQueues.delete(key);
            }
        });
        return result;
    }

    async safeSetConnectionState(connected) {
        if (!connected) {
            this.clearPendingSample();
        }
        if (this.connectionRequested === connected) {
            return;
        }
        this.connectionRequested = connected;
        try {
            await this.writeState('info.connection', connected);
            this.connectionState = connected;
        } catch (error) {
            if (this.connectionRequested === connected) {
                this.connectionRequested = undefined;
            }
            this.log.error(`Could not update info.connection: ${this.errorText(error)}`);
        }
    }

    logSerialError(error) {
        const now = Date.now();
        const text = this.errorText(error);
        if (text === this.lastSerialError && now - this.lastSerialErrorTime < ERROR_LOG_COOLDOWN_MS) {
            return;
        }
        this.lastSerialError = text;
        this.lastSerialErrorTime = now;
        this.log.error(`VE.Direct serial error: ${text}`);
    }

    onUnload(callback) {
        if (this.unloadPromise) {
            void this.unloadPromise.then(callback, callback);
            return;
        }
        this.unloaded = true;
        if (this.watchDogInterval) {
            clearInterval(this.watchDogInterval);
            this.watchDogInterval = undefined;
        }
        this.clearPendingSample();
        this.com.onFrame = undefined;
        this.com.onValidFrame = undefined;
        const operation = this.performUnload(this.activeWatchDog, this.readyPromise);
        this.unloadPromise = operation;
        let unloadCallbackInvoked = false;
        const finish = error => {
            if (unloadCallbackInvoked) {
                return;
            }
            unloadCallbackInvoked = true;
            if (error) {
                this.log.error(`Error during VE.Direct unload: ${this.errorText(error)}`);
            }
            callback();
        };
        void operation.then(() => finish(), finish);
    }

    async performUnload(pendingWatchDog, pendingReady) {
        const deadline = Date.now() + this.unloadTimeoutMs;
        const pending = [
            this.com.close().catch(error => this.log.error(`Error closing VE.Direct port: ${this.errorText(error)}`)),
        ];
        if (pendingWatchDog) {
            pending.push(pendingWatchDog.catch(() => undefined));
        }
        if (pendingReady) {
            pending.push(pendingReady.catch(() => undefined));
        }
        await this.settleWithin(Promise.all(pending), deadline);
        await this.settleWithin(this.safeSetConnectionState(false), deadline);
        await this.settleWithin(Promise.all([...this.stateQueues.values(), this.frameQueue]), deadline);
    }

    settleWithin(promise, deadline) {
        const remaining = Math.max(0, deadline - Date.now());
        /** @type {Promise<void>} */
        const settled = new Promise(resolve => {
            const timer = setTimeout(resolve, remaining);
            promise.then(
                () => {
                    clearTimeout(timer);
                    resolve();
                },
                () => {
                    clearTimeout(timer);
                    resolve();
                },
            );
        });
        return settled;
    }

    errorText(error) {
        return error instanceof Error ? error.stack || error.message : String(error);
    }
}

// @ts-expect-error module.parent exists in the CommonJS runtime.
if (module.parent) {
    module.exports = options => new Vedirect(options);
    module.exports.Vedirect = Vedirect;
} else {
    new Vedirect();
}
