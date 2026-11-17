'use strict';

const { decodeVeDirectField } = require('./fields.js');

const COLON = 0x3a;
const LF = 0x0a;
const CR = 0x0d;
const TAB = 0x09;
const MAX_FRAME_BYTES = 8192;
const MAX_LINE_BYTES = 128;
const CHECKSUM_LABEL = Buffer.from('Checksum\t', 'ascii');

/**
 * Atomic, byte-oriented VE.Direct TEXT parser following the official FAQ
 * state priorities. A checksum byte is never interpreted as HEX. An
 * asynchronous HEX message discards an interrupted TEXT block; the next
 * complete block resynchronizes the parser.
 */
class VeDirectParser {
    constructor() {
        /** @type {((frame: Record<string, any>) => void)|undefined} */
        this.onFrame = undefined;
        /** @type {(() => void)|undefined} */
        this.onValidFrame = undefined;
        /** @type {'idle'|'text'|'checksum'|'hex'|'orphanColon'} */
        this.state = 'idle';
        /** @type {number[]} */
        this.line = [];
        /** @type {Record<string, any>} */
        this.records = {};
        this.checksum = 0;
        this.frameBytes = 0;
        this.malformed = false;
        this.overflow = false;
        this.idleSawCR = false;
        this.idleHadGarbage = false;
        this.candidateFromGarbage = false;
        /** @type {number|undefined} */
        this.previousTextByte = undefined;
        this.checksumErrors = 0;
        this.invalidFrames = 0;
        this.unknownFields = 0;
        this.invalidValues = 0;
        this.hexMessages = 0;
        this.reset();
    }

    receive(data) {
        for (const byte of data) {
            if (this.state === 'orphanColon') {
                if (byte === 0x41) {
                    this.enterHex();
                } else {
                    this.state = 'idle';
                    if (byte === COLON) {
                        this.enterHex();
                    } else {
                        this.receiveIdleByte(byte);
                    }
                }
                continue;
            }
            if (this.state === 'hex') {
                if (byte === LF) {
                    this.hexMessages++;
                    this.state = 'idle';
                    this.idleSawCR = false;
                }
                continue;
            }

            // The official reference gives CHECKSUM precedence over colon/HEX.
            if (byte === COLON && this.state !== 'checksum') {
                if (
                    this.state === 'text' &&
                    this.candidateFromGarbage &&
                    this.line.length === 0 &&
                    Object.keys(this.records).length === 0
                ) {
                    // A checksum colon can be followed by the remainder of an
                    // ambiguous HEX message. Discard that orphan instead of
                    // swallowing the next block.
                    this.state = 'orphanColon';
                    this.candidateFromGarbage = false;
                    this.idleHadGarbage = false;
                    continue;
                }
                this.enterHex();
                continue;
            }

            switch (this.state) {
                case 'idle':
                    this.receiveIdleByte(byte);
                    break;
                case 'text':
                    this.receiveTextByte(byte);
                    break;
                case 'checksum':
                    this.addToChecksum(byte);
                    this.completeFrame();
                    break;
            }
        }
    }

    enterHex() {
        this.state = 'hex';
        this.line = [];
        this.records = {};
        this.checksum = 0;
        this.frameBytes = 0;
        this.malformed = false;
        this.overflow = false;
        this.idleSawCR = false;
        this.idleHadGarbage = false;
        this.candidateFromGarbage = false;
    }

    reset() {
        this.state = 'idle';
        this.checksum = 0;
        this.frameBytes = 0;
        this.line = [];
        this.records = {};
        this.malformed = false;
        this.overflow = false;
        this.idleSawCR = false;
        this.idleHadGarbage = false;
        this.candidateFromGarbage = false;
        this.previousTextByte = undefined;
    }

    receiveIdleByte(byte) {
        if (byte === CR) {
            this.idleSawCR = true;
            return;
        }
        if (byte === LF) {
            const fromGarbage = this.idleHadGarbage;
            this.startFrame(this.idleSawCR);
            this.candidateFromGarbage = fromGarbage;
            this.idleHadGarbage = false;
            return;
        }
        this.idleSawCR = false;
        this.idleHadGarbage = true;
    }

    startFrame(withCR) {
        this.state = 'text';
        this.checksum = withCR ? (CR + LF) & 0xff : LF;
        this.frameBytes = withCR ? 2 : 1;
        this.line = [];
        this.records = {};
        this.malformed = false;
        this.overflow = false;
        this.idleSawCR = false;
        this.idleHadGarbage = false;
        this.candidateFromGarbage = false;
        this.previousTextByte = undefined;
    }

    receiveTextByte(byte) {
        const endedWithCR = this.previousTextByte === CR;
        this.addToChecksum(byte);
        if (this.frameBytes > MAX_FRAME_BYTES) {
            this.markOverflow();
        }
        if (!this.overflow && this.line.length < MAX_LINE_BYTES) {
            this.line.push(byte);
        } else {
            this.markOverflow();
        }

        if (byte === LF) {
            const result = this.finishLine();
            this.line = [];
            if (result === 'restart') {
                if (!this.overflow) {
                    this.invalidFrames++;
                }
                this.startFrame(endedWithCR);
            } else if (result === 'empty') {
                this.startFrame(endedWithCR);
            } else {
                this.previousTextByte = byte;
            }
            return;
        }

        this.previousTextByte = byte;
        if (Buffer.from(this.line).equals(CHECKSUM_LABEL)) {
            this.state = 'checksum';
        }
    }

    addToChecksum(byte) {
        this.checksum = (this.checksum + byte) & 0xff;
        this.frameBytes++;
    }

    markOverflow() {
        if (!this.overflow) {
            this.invalidFrames++;
        }
        this.overflow = true;
    }

    finishLine() {
        if (this.overflow) {
            return 'restart';
        }
        let line = this.line;
        if (line[line.length - 1] === LF) {
            line = line.slice(0, -1);
        }
        if (line[line.length - 1] === CR) {
            line = line.slice(0, -1);
        }
        if (line.length === 0) {
            return 'empty';
        }
        const tab = line.indexOf(TAB);
        if (tab <= 0) {
            return 'restart';
        }
        const label = Buffer.from(line.slice(0, tab)).toString('ascii');
        const value = Buffer.from(line.slice(tab + 1)).toString('ascii');
        try {
            const decoded = decodeVeDirectField(label, value);
            if (decoded === null) {
                this.unknownFields++;
            } else {
                Object.assign(this.records, decoded);
            }
        } catch {
            this.invalidValues++;
            this.malformed = true;
        }
        return 'normal';
    }

    completeFrame() {
        try {
            if (this.checksum !== 0) {
                this.checksumErrors++;
            } else if (this.malformed || this.overflow) {
                this.invalidFrames++;
            } else {
                if (this.onValidFrame) {
                    this.onValidFrame();
                }
                if (Object.keys(this.records).length > 0 && this.onFrame) {
                    // Publish a snapshot only after the complete frame passed
                    // checksum and value validation.
                    this.onFrame({ ...this.records });
                }
            }
        } finally {
            // Callback failures must never leave a partially received frame in
            // the parser. Deliberately keep diagnostic counters cumulative.
            this.reset();
        }
    }
}

module.exports = { VeDirectParser };
