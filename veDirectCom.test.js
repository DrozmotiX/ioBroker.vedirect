'use strict';

const { EventEmitter } = require('node:events');
const { expect } = require('chai');
const { VeDirectCom } = require('./lib/veDirectCom');

class FakeSerialPort extends EventEmitter {
    constructor() {
        super();
        this.isOpen = false;
        this.setCalls = 0;
        this.closeCalls = 0;
        this.failOpen = undefined;
        this.failSet = undefined;
        this.failClose = undefined;
        this.closeGate = undefined;
        this.emitCloseOnClose = true;
        this.setOptions = undefined;
    }

    set(options, callback) {
        this.setCalls++;
        this.setOptions = options;
        callback(this.failSet ?? null);
    }

    close(callback) {
        this.closeCalls++;
        const wasOpen = this.isOpen;
        this.isOpen = false;
        const finish = () => {
            if (this.failClose) {
                this.isOpen = wasOpen;
                callback(this.failClose);
                return;
            }
            if (this.emitCloseOnClose) {
                this.emit('close');
            }
            callback(null);
        };
        if (this.closeGate) {
            void this.closeGate.then(finish);
        } else {
            finish();
        }
    }
}

function makeFrame(fields) {
    const body = Buffer.from(`\r\n${fields.map(([label, value]) => `${label}\t${value}\r\n`).join('')}Checksum\t`);
    let sum = 0;
    for (const byte of body) {
        sum = (sum + byte) & 0xff;
    }
    return Buffer.concat([body, Buffer.from([(256 - sum) & 0xff])]);
}

function immediate() {
    return new Promise(resolve => setImmediate(resolve));
}

function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

describe('VeDirectCom serial lifecycle', () => {
    it('opens 19200 8N1-compatible serial and receives validated frames', async () => {
        const port = new FakeSerialPort();
        let factoryCalls = 0;
        let baudRate = 0;
        const frames = [];
        let validFrames = 0;
        const com = new VeDirectCom((_path, options, callback) => {
            factoryCalls++;
            baudRate = options.baudRate;
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        com.onFrame = frame => frames.push(frame);
        com.onValidFrame = () => validFrames++;

        await com.open('fake');
        port.emit(
            'data',
            makeFrame([
                ['V', '13118'],
                ['I', '-1000'],
            ]),
        );

        expect(com.isOpen()).to.equal(true);
        expect(factoryCalls).to.equal(1);
        expect(baudRate).to.equal(19200);
        expect(port.setCalls).to.equal(1);
        expect(port.setOptions).to.deep.equal({ dtr: false, rts: false, cts: false, brk: false });
        expect(validFrames).to.equal(1);
        expect(frames).to.deep.equal([{ V: 13.118, I: -1 }]);
        await com.close();
        expect(com.isOpen()).to.equal(false);
        expect(port.closeCalls).to.equal(1);
    });

    it('handles open and set errors without an unhandled error event', async () => {
        for (const failure of ['open', 'set']) {
            const port = new FakeSerialPort();
            const error = new Error(`${failure} failed`);
            if (failure === 'open') {
                port.failOpen = error;
            } else {
                port.failSet = error;
            }
            const reported = [];
            const com = new VeDirectCom((_path, _options, callback) => {
                process.nextTick(() => {
                    if (failure !== 'open') {
                        port.isOpen = true;
                    }
                    callback(port.failOpen);
                });
                return port;
            });
            com.onError = error => reported.push(error);
            try {
                await com.open('fake');
                expect.fail('open should reject');
            } catch (actual) {
                expect(actual).to.equal(error);
            }
            expect(reported).to.deep.equal([error]);
            expect(com.isOpen()).to.equal(false);
            if (failure === 'set') {
                expect(port.closeCalls).to.equal(1);
            }
            await com.close();
        }
    });

    it('uses only one port while an open is pending', async () => {
        const port = new FakeSerialPort();
        let factoryCalls = 0;
        let completeOpen;
        const gate = new Promise(resolve => {
            completeOpen = resolve;
        });
        const com = new VeDirectCom((_path, _options, callback) => {
            factoryCalls++;
            void gate.then(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        const first = com.open('fake');
        const second = com.open('fake');
        expect(second).to.equal(first);
        completeOpen();
        await Promise.all([first, second]);
        expect(factoryCalls).to.equal(1);
        await com.close();
    });

    it('handles runtime errors and a close after an already closed port', async () => {
        const port = new FakeSerialPort();
        const reported = [];
        const com = new VeDirectCom((_path, _options, callback) => {
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        com.onError = error => reported.push(error);
        await com.open('fake');
        const error = new Error('runtime');
        port.emit('error', error);
        expect(reported).to.deep.equal([error]);
        port.isOpen = false;
        port.emit('close');
        await com.close();
        expect(port.closeCalls).to.equal(0);
    });

    it('rejects close errors without producing an unhandled error', async () => {
        const port = new FakeSerialPort();
        port.failClose = new Error('close failed');
        const com = new VeDirectCom((_path, _options, callback) => {
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        await com.open('fake');
        try {
            await com.close();
            expect.fail('close should reject');
        } catch (error) {
            expect(error).to.equal(port.failClose);
            expect(com.isOpen()).to.equal(true);
        }
        port.failClose = undefined;
        await com.close();
        expect(com.isOpen()).to.equal(false);
    });

    it('keeps a new port referenced when an old port emits a late close event', async () => {
        const first = new FakeSerialPort();
        first.emitCloseOnClose = false;
        const second = new FakeSerialPort();
        let factoryCalls = 0;
        const com = new VeDirectCom((_path, _options, callback) => {
            const port = factoryCalls++ === 0 ? first : second;
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });

        await com.open('first');
        await com.close();
        await com.open('second');
        first.emit('close');

        expect(com.isOpen()).to.equal(true);
        await com.close();
        expect(second.closeCalls).to.equal(1);
    });

    it('does not let a new open overtake a pending close', async () => {
        const first = new FakeSerialPort();
        let factoryCalls = 0;
        let releaseClose;
        first.closeGate = new Promise(resolve => {
            releaseClose = resolve;
        });
        const com = new VeDirectCom((_path, _options, callback) => {
            factoryCalls++;
            const port = first;
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        await com.open('fake');
        const closing = com.close();
        const opening = com.open('fake');
        await immediate();
        expect(factoryCalls).to.equal(1);
        releaseClose();
        await Promise.all([closing, opening]);
        expect(factoryCalls).to.equal(2);
        await com.close();
    });

    it('keeps a still-open port retryable when set cleanup close also fails', async () => {
        const port = new FakeSerialPort();
        port.failSet = new Error('set failed');
        port.failClose = new Error('cleanup close failed');
        const reported = [];
        const com = new VeDirectCom((_path, _options, callback) => {
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        com.onError = error => reported.push(error);
        try {
            await com.open('fake');
            expect.fail('open should reject');
        } catch (error) {
            expect(error).to.equal(port.failSet);
        }
        expect(com.isOpen()).to.equal(true);
        expect(port.closeCalls).to.equal(1);
        expect(reported).to.deep.equal([port.failClose, port.failSet]);

        port.failClose = undefined;
        await com.close();
        expect(port.closeCalls).to.equal(2);
        expect(com.isOpen()).to.equal(false);
    });

    it('rejects open and removes listeners when the port closes during set', async () => {
        const port = new FakeSerialPort();
        let finishSet;
        port.set = (_options, callback) => {
            finishSet = callback;
        };
        const com = new VeDirectCom((_path, _options, callback) => {
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        const opening = com.open('fake');
        await immediate();
        port.isOpen = false;
        port.emit('close');
        finishSet(null);
        try {
            await opening;
            expect.fail('open should reject');
        } catch (error) {
            expect(error.message).to.contain('closed while opening');
        }
        expect(com.isOpen()).to.equal(false);
        expect(port.listenerCount('data')).to.equal(0);
        expect(port.listenerCount('close')).to.equal(0);
        expect(port.listenerCount('error')).to.equal(0);
    });

    it('removes old listeners and ignores old data after an unexpected close', async () => {
        const ports = [new FakeSerialPort(), new FakeSerialPort()];
        const frames = [];
        let factoryCalls = 0;
        const com = new VeDirectCom((_path, _options, callback) => {
            const port = ports[factoryCalls++];
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        com.onFrame = frame => frames.push(frame);
        await com.open('first');
        ports[0].isOpen = false;
        ports[0].emit('close');
        expect(ports[0].listenerCount('data')).to.equal(0);
        expect(ports[0].listenerCount('close')).to.equal(0);
        expect(ports[0].listenerCount('error')).to.equal(0);

        await com.open('second');
        ports[0].emit('data', makeFrame([['I', '-1000']]));
        ports[1].emit('data', makeFrame([['V', '13118']]));
        expect(frames).to.deep.equal([{ V: 13.118 }]);
        await com.close();
    });

    it('supports factories with synchronous success and error callbacks', async () => {
        const successPort = new FakeSerialPort();
        const success = new VeDirectCom((_path, _options, callback) => {
            successPort.isOpen = true;
            callback();
            return successPort;
        });
        await success.open('sync');
        expect(success.isOpen()).to.equal(true);
        await success.close();

        const errorPort = new FakeSerialPort();
        const expected = new Error('sync open failed');
        const reported = [];
        const failure = new VeDirectCom((_path, _options, callback) => {
            callback(expected);
            return errorPort;
        });
        failure.onError = error => reported.push(error);
        try {
            await failure.open('sync');
            expect.fail('open should reject');
        } catch (error) {
            expect(error).to.equal(expected);
        }
        expect(reported).to.deep.equal([expected]);
        expect(failure.isOpen()).to.equal(false);
    });

    it('times out an open callback and closes a late-opening port', async () => {
        const port = new FakeSerialPort();
        let openCallback;
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                openCallback = callback;
                return port;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20 },
        );
        try {
            await com.open('slow');
            expect.fail('open should time out');
        } catch (error) {
            expect(error.message).to.contain('open timed out');
        }
        port.isOpen = true;
        openCallback();
        await immediate();
        expect(port.closeCalls).to.equal(1);
        expect(port.isOpen).to.equal(false);
        expect(com.isOpen()).to.equal(false);
    });

    it('reinstalls listeners when late open succeeds after an explicit close', async () => {
        const port = new FakeSerialPort();
        let openCallback;
        let releaseClose;
        port.closeGate = new Promise(resolve => (releaseClose = resolve));
        const reported = [];
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                openCallback = callback;
                return port;
            },
            { openTimeoutMs: 10, closeTimeoutMs: 20, lateCloseRetryMs: 1 },
        );
        com.onError = error => reported.push(error);
        await expect(com.open('slow')).to.be.rejectedWith('open timed out');
        await com.close();
        expect(port.listenerCount('error')).to.equal(0);
        expect(port.listenerCount('close')).to.equal(0);

        port.isOpen = true;
        openCallback();
        await immediate();
        expect(port.listenerCount('error')).to.equal(1);
        expect(port.listenerCount('close')).to.equal(1);
        const expected = new Error('late native error');
        expect(() => port.emit('error', expected)).not.to.throw();
        expect(reported).to.include(expected);
        releaseClose();
        await immediate();
        expect(port.isOpen).to.equal(false);
        expect(port.listenerCount('error')).to.equal(0);
    });

    it('times out a set callback and cleans up the open port', async () => {
        const port = new FakeSerialPort();
        port.set = () => undefined;
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                process.nextTick(() => {
                    port.isOpen = true;
                    callback();
                });
                return port;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20 },
        );
        try {
            await com.open('slow-set');
            expect.fail('set should time out');
        } catch (error) {
            expect(error.message).to.contain('set timed out');
        }
        expect(port.closeCalls).to.equal(1);
        expect(com.isOpen()).to.equal(false);
    });

    it('times out a close callback without losing a still-open port', async () => {
        const port = new FakeSerialPort();
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                process.nextTick(() => {
                    port.isOpen = true;
                    callback();
                });
                return port;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20 },
        );
        await com.open('slow-close');
        const realClose = port.close.bind(port);
        port.close = () => undefined;
        try {
            await com.close();
            expect.fail('close should time out');
        } catch (error) {
            expect(error.message).to.contain('close timed out');
        }
        expect(com.isOpen()).to.equal(true);
        port.close = realClose;
        await com.close();
        expect(com.isOpen()).to.equal(false);
    });

    it('keeps an outstanding native close retryable instead of replacing the port', async () => {
        const first = new FakeSerialPort();
        const second = new FakeSerialPort();
        let factoryCalls = 0;
        let releaseNativeClose;
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                const port = factoryCalls++ === 0 ? first : second;
                process.nextTick(() => {
                    port.isOpen = true;
                    callback();
                });
                return port;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20, lateCloseRetryMs: 1 },
        );

        await com.open('first');
        first.closeGate = new Promise(resolve => {
            releaseNativeClose = resolve;
        });
        try {
            await com.close();
            expect.fail('close should time out');
        } catch (error) {
            expect(error.message).to.contain('close timed out');
        }
        expect(first.isOpen).to.equal(false);
        expect(com.isOpen()).to.equal(false);
        expect(first.listenerCount('close')).to.equal(1);
        expect(first.listenerCount('error')).to.equal(1);

        try {
            await com.open('second');
            expect.fail('open must not replace a port whose close is outstanding');
        } catch (error) {
            expect(error.message).to.contain('close timed out');
        }
        expect(factoryCalls).to.equal(1);

        releaseNativeClose();
        await immediate();
        expect(first.listenerCount('close')).to.equal(0);
        expect(first.listenerCount('error')).to.equal(0);

        await com.open('second');
        expect(factoryCalls).to.equal(2);
        expect(com.isOpen()).to.equal(true);
        await com.close();
    });

    it('never lets a failed late close of an old port hijack the current session', async () => {
        const first = new FakeSerialPort();
        const second = new FakeSerialPort();
        const callbacks = [];
        const frames = [];
        let factoryCalls = 0;
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                const index = factoryCalls++;
                const port = index === 0 ? first : second;
                callbacks[index] = callback;
                if (index === 1) {
                    process.nextTick(() => {
                        port.isOpen = true;
                        callback();
                    });
                }
                return port;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20, lateCloseRetryMs: 1 },
        );
        com.onFrame = frame => frames.push(frame);
        try {
            await com.open('first');
            expect.fail('first open should time out');
        } catch (error) {
            expect(error.message).to.contain('open timed out');
        }
        await com.open('second');
        second.emit('data', makeFrame([['V', '13118']]));

        first.failClose = new Error('late old close failed');
        first.isOpen = true;
        callbacks[0]();
        await immediate();
        first.failClose = undefined;
        await delay(10);
        second.emit('data', makeFrame([['I', '1000']]));

        expect(frames).to.deep.equal([{ V: 13.118 }, { I: 1 }]);
        expect(first.closeCalls).to.equal(2);
        await com.close();
        expect(second.closeCalls).to.equal(1);
        expect(second.isOpen).to.equal(false);
    });

    it('keeps retrying an outstanding native close of a late port without dropping it', async () => {
        const late = new FakeSerialPort();
        let openCallback;
        const errors = [];
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                openCallback = callback;
                return late;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20, lateCloseRetryMs: 1 },
        );
        com.onError = error => errors.push(error);

        try {
            await com.open('late');
            expect.fail('open should time out');
        } catch (error) {
            expect(error.message).to.contain('open timed out');
        }
        late.closeGate = new Promise(() => undefined);
        late.isOpen = true;
        errors.length = 0;
        openCallback();
        await delay(80);

        expect(late.isOpen).to.equal(false);
        expect(late.closeCalls).to.equal(1);
        expect(late.listenerCount('close')).to.equal(1);
        expect(late.listenerCount('error')).to.equal(1);
        expect(errors.length).to.be.greaterThan(0);
        for (const error of errors) {
            expect(error.message).to.contain('close timed out');
        }

        late.emit('close');
        await immediate();
        expect(late.listenerCount('close')).to.equal(0);
        expect(late.listenerCount('error')).to.equal(0);
        await com.close();
    });

    it('creates a new operation for reopen immediately after aborting a pending open', async () => {
        const first = new FakeSerialPort();
        const second = new FakeSerialPort();
        const callbacks = [];
        let factoryCalls = 0;
        const com = new VeDirectCom((_path, _options, callback) => {
            const index = factoryCalls++;
            const port = index === 0 ? first : second;
            callbacks[index] = callback;
            if (index === 1) {
                process.nextTick(() => {
                    port.isOpen = true;
                    callback();
                });
            }
            return port;
        });
        const firstOpen = com.open('first');
        const closing = com.close();
        const reopen = com.open('second');
        expect(reopen).not.to.equal(firstOpen);
        first.isOpen = true;
        callbacks[0]();
        await Promise.all([firstOpen.catch(() => undefined), closing, reopen]);
        expect(factoryCalls).to.equal(2);
        expect(first.closeCalls).to.equal(1);
        expect(com.isOpen()).to.equal(true);
        await com.close();
    });

    it('cleans references and listeners after a late open error following timeout', async () => {
        const first = new FakeSerialPort();
        let openCallback;
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                openCallback = callback;
                return first;
            },
            { openTimeoutMs: 20, closeTimeoutMs: 20 },
        );
        try {
            await com.open('first');
            expect.fail('open should time out');
        } catch (error) {
            expect(error.message).to.contain('open timed out');
        }
        expect(first.listenerCount('error')).to.equal(1);
        expect(first.listenerCount('close')).to.equal(1);
        openCallback(new Error('late open error'));
        await immediate();
        expect(com.isOpen()).to.equal(false);
        expect(first.listenerCount('error')).to.equal(0);
        expect(first.listenerCount('close')).to.equal(0);
    });

    it('notifies every concurrent waiter when one native close completes', async () => {
        const first = new FakeSerialPort();
        const second = new FakeSerialPort();
        const closeTimeoutMs = 200;
        let firstOpenCallback;
        let releaseClose;
        first.closeGate = new Promise(resolve => {
            releaseClose = resolve;
        });
        let factoryCalls = 0;
        const reported = [];
        const com = new VeDirectCom(
            (_path, _options, callback) => {
                const index = factoryCalls++;
                const port = index === 0 ? first : second;
                if (index === 0) {
                    firstOpenCallback = callback;
                } else {
                    process.nextTick(() => {
                        port.isOpen = true;
                        callback();
                    });
                }
                return port;
            },
            { openTimeoutMs: 20, closeTimeoutMs, lateCloseRetryMs: 5 },
        );
        try {
            await com.open('first');
            expect.fail('first open should time out');
        } catch (error) {
            expect(error.message).to.contain('open timed out');
        }

        let initiatorTimedOut;
        const timedOut = new Promise(resolve => {
            initiatorTimedOut = resolve;
        });
        com.onError = error => {
            reported.push(error);
            initiatorTimedOut();
        };

        first.isOpen = true;
        firstOpenCallback();
        await immediate();
        expect(first.isOpen).to.equal(false); // SerialPort 12: closing implies isOpen=false.
        expect(first.closeCalls).to.equal(1);
        // Register the reopen half-way into the initiator's close window, so the
        // initiator can time out while the native close is still outstanding.
        await delay(closeTimeoutMs / 2);
        const reopening = com.open('second');
        await timedOut;
        // Only now does the native close complete. The earlier caller has already
        // given up, so the reopen is the sole observer of this completion.
        releaseClose();
        await reopening;
        await immediate();

        expect(factoryCalls).to.equal(2);
        expect(first.closeCalls).to.equal(1);
        expect(com.isOpen()).to.equal(true);
        expect(reported).to.have.length(1);
        await com.close();
    });

    it('resets a partial frame before a later reconnect', async () => {
        const port = new FakeSerialPort();
        const frames = [];
        const com = new VeDirectCom((_path, _options, callback) => {
            process.nextTick(() => {
                port.isOpen = true;
                callback();
            });
            return port;
        });
        com.onFrame = frame => frames.push(frame);
        await com.open('fake');
        const frame = makeFrame([['V', '13118']]);
        port.emit('data', frame.subarray(0, 10));
        await com.close();
        await com.open('fake');
        port.emit('data', frame);
        expect(frames).to.deep.equal([{ V: 13.118 }]);
        await com.close();
    });
});
