'use strict';

const { expect } = require('chai');
const { VeDirectParser } = require('./lib/veDirect/veDirectParser.js');

function makeFrame(fields, leadingNewline = true) {
    const body = Buffer.from(
        `${leadingNewline ? '\r\n' : ''}${fields.map(([label, value]) => `${label}\t${value}\r\n`).join('')}Checksum\t`,
        'ascii',
    );
    let sum = 0;
    for (const byte of body) {
        sum = (sum + byte) & 0xff;
    }
    return Buffer.concat([body, Buffer.from([(256 - sum) & 0xff])]);
}

function makeFrameWithChecksum(target) {
    const empty = makeFrame([
        ['V', '13118'],
        ['X_PAD', ''],
    ]);
    const required = (empty[empty.length - 1] - target) & 0xff;
    const buildPadding = (sum, length) => {
        if (length === 0) {
            return sum === 0 ? '' : undefined;
        }
        for (let byte = 32; byte <= 126; byte++) {
            if (byte === 0x3a) {
                continue;
            }
            const rest = sum - byte;
            if (rest < 32 * (length - 1) || rest > 126 * (length - 1)) {
                continue;
            }
            const tail = buildPadding(rest, length - 1);
            if (tail !== undefined) {
                return String.fromCharCode(byte) + tail;
            }
        }
        return undefined;
    };
    for (let length = 1; length <= 4; length++) {
        for (let sum = required; sum <= 126 * length; sum += 256) {
            const padding = buildPadding(sum, length);
            if (padding !== undefined) {
                return makeFrame([
                    ['V', '13118'],
                    ['X_PAD', padding],
                ]);
            }
        }
    }
    throw new Error(`No fixture for checksum ${target}`);
}

function collect(parser) {
    const frames = [];
    parser.onFrame = frame => frames.push(frame);
    return frames;
}

const officialFields = [
    ['PID', '0x203'],
    ['V', '26201'],
    ['I', '0'],
    ['P', '0'],
    ['CE', '0'],
    ['SOC', '1000'],
    ['TTG', '-1'],
    ['Alarm', 'OFF'],
    ['Relay', 'OFF'],
    ['AR', '0'],
    ['BMV', '700'],
    ['FW', '0307'],
];

const officialDecoded = {
    PID: 'BMV-700',
    V: 26.201,
    I: 0,
    P: 0,
    CE: 0,
    SOC: 100,
    TTG: null,
    TTGInfinite: true,
    Alarm: 'OFF',
    Relay: 'OFF',
    AR: 'Normal Operation',
    BMV: '700',
    FW: '0307',
};

describe('VE.Direct byte parser', () => {
    it('accepts the exact official FAQ frame, including PID, P and TTG=-1', () => {
        const frame = makeFrame(officialFields);
        expect(frame[frame.length - 1]).to.equal(0xd8);
        const parser = new VeDirectParser();
        const frames = collect(parser);
        let validFrames = 0;
        parser.onValidFrame = () => validFrames++;

        parser.receive(frame);

        expect(frames).to.deep.equal([officialDecoded]);
        expect(validFrames).to.equal(1);
        expect(parser.unknownFields).to.equal(0);
        expect(parser.checksumErrors).to.equal(0);
        expect(parser.invalidFrames).to.equal(0);
    });

    it('handles every possible chunk boundary', () => {
        const frame = makeFrame(officialFields);
        for (let split = 0; split <= frame.length; split++) {
            const parser = new VeDirectParser();
            const frames = collect(parser);
            parser.receive(frame.subarray(0, split));
            expect(frames, `before split ${split}`).to.have.length(split === frame.length ? 1 : 0);
            parser.receive(frame.subarray(split));
            expect(frames, `after split ${split}`).to.deep.equal([officialDecoded]);
        }
    });

    it('completes immediately after the checksum byte without trailing CRLF', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(makeFrame([['V', '13118']]));
        expect(frames).to.deep.equal([{ V: 13.118 }]);
    });

    it('accepts every possible binary checksum byte', () => {
        for (let checksum = 0; checksum <= 0xff; checksum++) {
            const parser = new VeDirectParser();
            const frames = collect(parser);
            parser.receive(makeFrameWithChecksum(checksum));
            expect(frames, `checksum ${checksum}`).to.deep.equal([{ V: 13.118 }]);
            expect(parser.checksumErrors, `checksum ${checksum}`).to.equal(0);
        }
    });

    it('rejects a corrupted frame without publishing partial data', () => {
        const frame = makeFrame(officialFields);
        frame[15] ^= 1;
        const parser = new VeDirectParser();
        const frames = collect(parser);
        let validFrames = 0;
        parser.onValidFrame = () => validFrames++;
        parser.receive(frame);
        expect(frames).to.have.length(0);
        expect(validFrames).to.equal(0);
        expect(parser.checksumErrors).to.equal(1);
    });

    it('publishes only fields contained in each of multiple blocks', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(
            Buffer.concat([
                makeFrame([
                    ['V', '13118'],
                    ['I', '1000'],
                ]),
                makeFrame([
                    ['H4', '3'],
                    ['H5', '1'],
                ]),
            ]),
        );
        expect(frames).to.deep.equal([
            { V: 13.118, I: 1 },
            { H4: 3, H5: 1 },
        ]);
        expect(frames[0]).not.to.have.property('H4');
        expect(frames[1]).not.to.have.property('V');
    });

    it('discards HEX-interrupted TEXT frames and resynchronizes at the next block', () => {
        const frame = makeFrame(officialFields);
        const next = makeFrame([['I', '1000']]);
        for (const position of [0, 20, Math.floor(frame.length / 2), frame.length - 1, frame.length]) {
            const parser = new VeDirectParser();
            const frames = collect(parser);
            const withHex = Buffer.concat([
                frame.subarray(0, position),
                Buffer.from(':A1234\n'),
                frame.subarray(position),
                next,
            ]);
            parser.receive(withHex);
            if (position === 0 || position === frame.length) {
                expect(
                    frames.some(item => item.V === 26.201),
                    `HEX outside TEXT at ${position}`,
                ).to.equal(true);
            } else {
                expect(
                    frames.some(item => item.V !== undefined),
                    `interrupted TEXT at ${position}`,
                ).to.equal(false);
            }
            expect(frames[frames.length - 1], `next block after HEX at ${position}`).to.deep.equal({ I: 1 });
        }
    });

    it('classifies real HEX after garbage without breaking orphan recovery', () => {
        for (const prefix of ['X\n', 'X\r\n']) {
            const stream = Buffer.concat([Buffer.from(prefix), Buffer.from(':A1234\n'), makeFrame([['V', '13118']])]);
            for (let split = 0; split <= stream.length; split++) {
                const parser = new VeDirectParser();
                const frames = collect(parser);
                parser.receive(stream.subarray(0, split));
                parser.receive(stream.subarray(split));
                expect(frames, `${JSON.stringify(prefix)} split ${split}`).to.deep.equal([{ V: 13.118 }]);
                expect(parser.hexMessages, `${JSON.stringify(prefix)} split ${split}`).to.equal(1);
            }
        }
    });

    it('handles several HEX messages and resynchronizes the next TEXT frame', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        const frame = makeFrame([['V', '13118']]);
        parser.receive(Buffer.concat([Buffer.from(':A1\n:A2\n'), frame, Buffer.from(':A3\n'), frame]));
        expect(frames).to.deep.equal([{ V: 13.118 }, { V: 13.118 }]);
        expect(parser.hexMessages).to.equal(3);
    });

    it('gives CHECKSUM priority over a 0x3A byte at every chunk boundary', () => {
        const frame = makeFrameWithChecksum(0x3a);
        const next = makeFrame([['I', '1000']]);
        const stream = Buffer.concat([
            frame.subarray(0, frame.length - 1),
            Buffer.from(':A1234\n'),
            frame.subarray(frame.length - 1),
            next,
        ]);
        for (let split = 0; split <= stream.length; split++) {
            const parser = new VeDirectParser();
            const frames = collect(parser);
            parser.receive(stream.subarray(0, split));
            parser.receive(stream.subarray(split));
            expect(frames, `split ${split}`).to.deep.equal([{ V: 13.118 }, { I: 1 }]);
            expect(parser.checksumErrors, `split ${split}`).to.equal(0);
        }
    });

    it('immediately rejects a corrupted frame whose received checksum is 0x3A', () => {
        const frame = makeFrameWithChecksum(0x3a);
        frame[5] ^= 1;
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(frame);
        expect(frames).to.have.length(0);
        expect(parser.checksumErrors).to.equal(1);
    });

    it('recovers at every line-limit boundary, including 127 and 128 bytes', () => {
        for (const length of [127, 128, 129, 200]) {
            const parser = new VeDirectParser();
            const frames = collect(parser);
            parser.receive(
                Buffer.concat([Buffer.from('\r\n'), Buffer.from('X'.repeat(length)), makeFrame([['V', '13118']])]),
            );
            expect(frames, `garbage length ${length}`).to.deep.equal([{ V: 13.118 }]);
            expect(parser.invalidFrames, `garbage length ${length}`).to.equal(1);
        }
    });

    it('bounds a frame with many individually valid lines and recovers', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        const oversized = makeFrame(Array.from({ length: 70 }, () => ['X_NEW', 'X'.repeat(110)]));
        expect(oversized.length).to.be.greaterThan(8192);
        parser.receive(Buffer.concat([oversized, makeFrame([['V', '13118']])]));
        expect(parser.invalidFrames).to.be.greaterThan(0);
        expect(frames[frames.length - 1]).to.deep.equal({ V: 13.118 });
    });

    it('resynchronizes on the first complete block after an orphaned checksum byte', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(Buffer.concat([Buffer.from([0xd8]), makeFrame([['I', '1000']])]));
        expect(frames).to.deep.equal([{ I: 1 }]);
    });

    it('ignores unknown and own-property-looking labels without discarding known values', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(
            makeFrame([
                ['toString', '123'],
                ['constructor', '123'],
                ['__proto__', '123'],
                ['hasOwnProperty', '123'],
                ['V', '13118'],
            ]),
        );
        expect(frames).to.deep.equal([{ V: 13.118 }]);
        expect(parser.unknownFields).to.equal(4);
        expect(parser.invalidFrames).to.equal(0);
    });

    it('treats a checksum-valid unknown-only block as valid liveness', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        let validFrames = 0;
        parser.onValidFrame = () => validFrames++;
        parser.receive(makeFrame([['X_NEW', '123']]));
        expect(frames).to.have.length(0);
        expect(validFrames).to.equal(1);
        expect(parser.invalidFrames).to.equal(0);
        expect(parser.unknownFields).to.equal(1);
    });

    it('rejects checksum-valid frames containing malformed numeric values', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        let validFrames = 0;
        parser.onValidFrame = () => validFrames++;

        parser.receive(
            makeFrame([
                ['V', '0x3336'],
                ['I', '1e2'],
            ]),
        );
        expect(frames).to.have.length(0);
        expect(validFrames).to.equal(0);
        expect(parser.invalidValues).to.equal(2);
        expect(parser.invalidFrames).to.equal(1);

        parser.receive(makeFrame([['V', '13118']]));
        expect(frames).to.deep.equal([{ V: 13.118 }]);
    });

    it('rejects malformed lines and recovers at the following complete block', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(Buffer.from('\r\nmalformed-line\r\n'));
        expect(parser.invalidFrames).to.equal(1);
        parser.receive(makeFrame([['V', '13118']]));
        expect(frames).to.deep.equal([{ V: 13.118 }]);
    });

    it('resets partial state in finally when a callback throws', () => {
        const parser = new VeDirectParser();
        parser.onValidFrame = () => {
            throw new Error('callback failure');
        };
        expect(() => parser.receive(makeFrame([['V', '13118']]))).to.throw('callback failure');
        parser.onValidFrame = undefined;
        const frames = collect(parser);
        parser.receive(makeFrame([['I', '1000']]));
        expect(frames).to.deep.equal([{ I: 1 }]);
    });

    it('parses real BMV production values while retaining raw H1/H3 mAh', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(
            makeFrame([
                ['V', '13336'],
                ['I', '2213'],
                ['SOC', '1000'],
                ['TTG', '-1'],
                ['BMV', '602S'],
                ['FW', '211'],
                ['H1', '-651715'],
                ['H3', '-398413'],
                ['H4', '29'],
                ['H6', '-73183800'],
            ]),
        );
        expect(frames).to.deep.equal([
            {
                V: 13.336,
                I: 2.213,
                SOC: 100,
                TTG: null,
                TTGInfinite: true,
                BMV: '602S',
                FW: '211',
                H1: -651715,
                H3: -398413,
                H4: 29,
                H6: -73183.8,
            },
        ]);
    });

    it('parses real SmartSolar MPPT 100|50 production values', () => {
        const parser = new VeDirectParser();
        const frames = collect(parser);
        parser.receive(
            makeFrame([
                ['PID', '0xA057'],
                ['V', '13290'],
                ['VPV', '290'],
                ['I', '0'],
                ['PPV', '0'],
                ['H19', '214821'],
                ['H20', '12'],
                ['H21', '53'],
                ['H22', '28'],
                ['H23', '212'],
                ['HSDS', '226'],
            ]),
        );
        expect(frames).to.deep.equal([
            {
                PID: 'SmartSolar MPPT 100|50',
                V: 13.29,
                VPV: 0.29,
                I: 0,
                PPV: 0,
                H19: 2148.21,
                H20: 0.12,
                H21: 53,
                H22: 0.28,
                H23: 212,
                HSDS: 226,
            },
        ]);
    });
});
