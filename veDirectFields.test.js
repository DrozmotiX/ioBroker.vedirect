'use strict';

const { expect } = require('chai');
const stateAttr = require('./lib/stateAttr.js');
const { VE_DIRECT_FIELDS, decodeVeDirectField } = require('./lib/veDirect/fields.js');

describe('VE.Direct field conversion', () => {
    it('provides a null-prototype lookup with complete field metadata', () => {
        expect(Object.getPrototypeOf(VE_DIRECT_FIELDS)).to.equal(null);
        const expectedIds = [...Object.keys(stateAttr), 'TTGInfinite', 'CAP_BLE'];
        expect(Object.keys(VE_DIRECT_FIELDS)).to.have.members(expectedIds);
        expect(Object.keys(VE_DIRECT_FIELDS)).to.have.length(expectedIds.length);
        for (const [id, field] of Object.entries(VE_DIRECT_FIELDS)) {
            expect(field, id).to.have.all.keys('id', 'type', 'role', 'unit', 'label', 'descr', 'expire', 'decode');
            expect(field.id).to.equal(id);
            expect(field.decode).to.be.a('function');
            expect(field.label).to.be.a('string').and.not.equal('');
            expect(field.descr).to.be.a('string').and.not.equal('');
            expect(field.expire).to.be.a('boolean');
        }
    });

    it('uses the documented live voltage, current, power and charge scales', () => {
        expect(decodeVeDirectField('V', '13118')).to.deep.equal({ V: 13.118 });
        expect(decodeVeDirectField('V2', '13290')).to.deep.equal({ V2: 13.29 });
        expect(decodeVeDirectField('V3', '12900')).to.deep.equal({ V3: 12.9 });
        expect(decodeVeDirectField('VS', '12801')).to.deep.equal({ VS: 12.801 });
        expect(decodeVeDirectField('VM', '25803')).to.deep.equal({ VM: 25.803 });
        expect(decodeVeDirectField('VPV', '290')).to.deep.equal({ VPV: 0.29 });
        expect(decodeVeDirectField('DM', '12')).to.deep.equal({ DM: 1.2 });
        expect(decodeVeDirectField('I', '-4368')).to.deep.equal({ I: -4.368 });
        expect(decodeVeDirectField('I2', '1001')).to.deep.equal({ I2: 1.001 });
        expect(decodeVeDirectField('I3', '-1001')).to.deep.equal({ I3: -1.001 });
        expect(decodeVeDirectField('IL', '2500')).to.deep.equal({ IL: 2.5 });
        expect(decodeVeDirectField('PPV', '123')).to.deep.equal({ PPV: 123 });
        expect(decodeVeDirectField('P', '-23')).to.deep.equal({ P: -23 });
        expect(decodeVeDirectField('CE', '-60')).to.deep.equal({ CE: -0.06 });
        expect(decodeVeDirectField('SOC', '1000')).to.deep.equal({ SOC: 100 });
        expect(decodeVeDirectField('T', '---')).to.deep.equal({ T: null });
    });

    it('preserves historic H1-H3 values and applies the existing history scales', () => {
        expect(decodeVeDirectField('H1', '-651715')).to.deep.equal({ H1: -651715 });
        expect(decodeVeDirectField('H2', '12000')).to.deep.equal({ H2: 12000 });
        expect(decodeVeDirectField('H3', '-398413')).to.deep.equal({ H3: -398413 });
        expect(VE_DIRECT_FIELDS.H1.unit).to.equal('mAh');
        expect(VE_DIRECT_FIELDS.H2.unit).to.equal('mAh');
        expect(VE_DIRECT_FIELDS.H3.unit).to.equal('mAh');
        expect(decodeVeDirectField('H4', '29')).to.deep.equal({ H4: 29 });
        expect(decodeVeDirectField('H5', '2')).to.deep.equal({ H5: 2 });
        expect(decodeVeDirectField('H6', '-368537')).to.deep.equal({ H6: -368.537 });
        expect(decodeVeDirectField('H7', '12001')).to.deep.equal({ H7: 12.001 });
        expect(decodeVeDirectField('H8', '14500')).to.deep.equal({ H8: 14.5 });
        expect(decodeVeDirectField('H9', '172800')).to.deep.equal({ H9: 172800 });
        expect(decodeVeDirectField('H15', '12001')).to.deep.equal({ H15: 12.001 });
        expect(decodeVeDirectField('H16', '14500')).to.deep.equal({ H16: 14.5 });
        expect(VE_DIRECT_FIELDS.H15.unit).to.equal('V');
        expect(VE_DIRECT_FIELDS.H16.unit).to.equal('V');
    });

    it('scales all energy counters to kWh and gives them energy roles', () => {
        const expected = { H17: 41.06, H18: 96.64, H19: 2148.21, H20: 0.12, H22: 0.28 };
        const raw = { H17: '4106', H18: '9664', H19: '214821', H20: '12', H22: '28' };
        for (const [id, value] of Object.entries(expected)) {
            expect(decodeVeDirectField(id, raw[id])).to.deep.equal({ [id]: value });
            expect(VE_DIRECT_FIELDS[id].role).to.equal('value.energy');
            expect(VE_DIRECT_FIELDS[id].unit).to.equal('kWh');
        }
        expect(decodeVeDirectField('H21', '53')).to.deep.equal({ H21: 53 });
        expect(decodeVeDirectField('H23', '212')).to.deep.equal({ H23: 212 });
        expect(decodeVeDirectField('HSDS', '226')).to.deep.equal({ HSDS: 226 });
    });

    it('keeps TTG in minutes and represents infinite and unavailable values explicitly', () => {
        expect(decodeVeDirectField('TTG', '240')).to.deep.equal({ TTG: 240, TTGInfinite: false });
        expect(VE_DIRECT_FIELDS.TTG.unit).to.equal('Minutes');
        expect(decodeVeDirectField('TTG', '-1')).to.deep.equal({ TTG: null, TTGInfinite: true });
        expect(decodeVeDirectField('TTG', '---')).to.deep.equal({ TTG: null, TTGInfinite: null });
        expect(() => decodeVeDirectField('TTG', '-2')).to.throw();
    });

    it('canonicalizes ON/OFF strings without changing their state type', () => {
        for (const label of ['Alarm', 'Relay', 'LOAD']) {
            for (const value of ['ON', 'On', 'on']) {
                expect(decodeVeDirectField(label, value)).to.deep.equal({ [label]: 'ON' });
            }
            for (const value of ['OFF', 'Off', 'off']) {
                expect(decodeVeDirectField(label, value)).to.deep.equal({ [label]: 'OFF' });
            }
            expect(VE_DIRECT_FIELDS[label].type).to.equal('string');
            expect(() => decodeVeDirectField(label, 'yes')).to.throw();
            expect(() => decodeVeDirectField(label, ' ON')).to.throw();
        }
    });

    it('preserves firmware strings and other textual identifiers verbatim', () => {
        expect(decodeVeDirectField('FW', '0307')).to.deep.equal({ FW: '0307' });
        expect(decodeVeDirectField('FW', 'C208')).to.deep.equal({ FW: 'C208' });
        expect(decodeVeDirectField('FWE', '0208FF')).to.deep.equal({ FWE: '0208FF' });
        expect(decodeVeDirectField('FWE', '208FF')).to.deep.equal({ FWE: '208FF' });
        expect(VE_DIRECT_FIELDS.FW.type).to.equal('string');
        expect(VE_DIRECT_FIELDS.FWE.type).to.equal('string');
        expect(decodeVeDirectField('BMV', '602S')).to.deep.equal({ BMV: '602S' });
        expect(decodeVeDirectField('SER#', 'HQ1328Y6TF6')).to.deep.equal({ 'SER#': 'HQ1328Y6TF6' });
    });

    it('rejects non-decimal numeric tokens for every numeric field', () => {
        const numericLabels = Object.values(VE_DIRECT_FIELDS)
            .filter(field => field.type === 'number')
            .map(field => field.id);
        expect(numericLabels).to.include.members(['V', 'I', 'SOC', 'TTG', 'H9', 'H17', 'DC_IN_P']);
        for (const label of numericLabels) {
            for (const value of ['0x3336', '0b101', '1e2', '1.0', ' 1', '1 ', '+', '-', '', '12x']) {
                expect(() => decodeVeDirectField(label, value), `${label}=${JSON.stringify(value)}`).to.throw();
            }
        }
    });

    it('maps unavailable numeric sentinels to null without NaN or Infinity', () => {
        const numericLabels = Object.values(VE_DIRECT_FIELDS)
            .filter(field => field.type === 'number')
            .map(field => field.id);
        for (const label of numericLabels) {
            const decoded = decodeVeDirectField(label, '---');
            expect(decoded, label).not.to.equal(null);
            expect(Object.values(decoded)[0], label).to.equal(null);
            for (const value of Object.values(decoded)) {
                expect(typeof value === 'number' && !Number.isFinite(value), label).to.equal(false);
            }
        }
    });

    it('resolves normalized hexadecimal PIDs to long product names', () => {
        expect(decodeVeDirectField('PID', '0x203')).to.deep.equal({ PID: 'BMV-700' });
        expect(decodeVeDirectField('PID', '0xa057')).to.deep.equal({ PID: 'SmartSolar MPPT 100|50' });
        expect(decodeVeDirectField('PID', '0x0300')).to.deep.equal({ PID: 'BlueSolar MPPT 70|15' });
        expect(decodeVeDirectField('PID', '0xA080')).to.deep.equal({ PID: 'SmartSolar MPPT 250|60 rev3' });
        expect(decodeVeDirectField('PID', '0xA3F0')).to.deep.equal({ PID: 'Orion XS 12V/12V-50A' });
        expect(decodeVeDirectField('PID', '0xA3F1')).to.deep.equal({ PID: 'Orion XS 1400' });
        expect(decodeVeDirectField('PID', '0xFFFF')).to.deep.equal({ PID: 'unknown PID = 0xFFFF' });
        expect(decodeVeDirectField('PID', 'not-a-pid')).to.deep.equal({ PID: 'unknown PID = not-a-pid' });
    });

    it('decodes operation, error, device, tracker and monitor tables', () => {
        expect(decodeVeDirectField('ERR', '2')).to.deep.equal({ ERR: 'Battery voltage too high' });
        expect(decodeVeDirectField('CS', '5')).to.deep.equal({ CS: 'Float' });
        expect(decodeVeDirectField('MODE', '4')).to.deep.equal({ MODE: 'VE_REG_MODE_OFF' });
        expect(decodeVeDirectField('MPPT', '2')).to.deep.equal({ MPPT: 'MPP Tracker active' });
        expect(decodeVeDirectField('MON', '-9')).to.deep.equal({ MON: 'Solar Charger' });
        expect(decodeVeDirectField('ERR', '999')).to.deep.equal({ ERR: 'unknown error state = 999' });
        expect(decodeVeDirectField('CS', '254')).to.deep.equal({ CS: 'unknown operation state = 254' });
        for (const label of ['ERR', 'CS', 'MODE', 'MPPT', 'MON']) {
            expect(() => decodeVeDirectField(label, '1e2'), label).to.throw();
            expect(() => decodeVeDirectField(label, ' 1'), label).to.throw();
        }
    });

    it('decodes AR, WARN and OR as composed bit fields including unknown bits', () => {
        expect(decodeVeDirectField('AR', '0')).to.deep.equal({ AR: 'Normal Operation' });
        expect(decodeVeDirectField('AR', '5')).to.deep.equal({ AR: 'Low Voltage, Low SOC' });
        expect(decodeVeDirectField('WARN', '3')).to.deep.equal({ WARN: 'Low Voltage, High Voltage' });
        expect(decodeVeDirectField('AR', '16385')).to.deep.equal({ AR: 'Low Voltage, unknown alarm reason = 16384' });
        expect(decodeVeDirectField('OR', '0x00000000')).to.deep.equal({ OR: 'Normal Operation' });
        expect(decodeVeDirectField('OR', '0x00000011')).to.deep.equal({ OR: 'No input power, Protection active' });
        // These bits have over-padded keys in the legacy OffReasons table.
        expect(decodeVeDirectField('OR', '0x00000010')).to.deep.equal({ OR: 'Protection active' });
        expect(decodeVeDirectField('OR', '0x00000020')).to.deep.equal({ OR: 'Paygo' });
        expect(decodeVeDirectField('OR', '0x00000040')).to.deep.equal({ OR: 'BMS' });
        expect(decodeVeDirectField('OR', '0x00000080')).to.deep.equal({ OR: 'Engine shutdown detection' });
        expect(decodeVeDirectField('OR', '0x00000201')).to.deep.equal({
            OR: 'No input power, unknown off reason = 512',
        });
        expect(() => decodeVeDirectField('AR', '0x5')).to.throw();
        expect(() => decodeVeDirectField('OR', '-1')).to.throw();
    });

    it('decodes BLE capabilities through its legacy table with normalized keys', () => {
        expect(decodeVeDirectField('CAP_BLE', '0x00000001')).to.deep.equal({ CAP_BLE: 'BLE supports switching off' });
        expect(decodeVeDirectField('CAP_BLE', '2')).to.deep.equal({ CAP_BLE: 'BLE switching off is permanent' });
        expect(decodeVeDirectField('CAP_BLE', '3')).to.deep.equal({ CAP_BLE: 'unknown BLE reason = 3' });
    });

    it('covers Phoenix and Orion input/output scaling', () => {
        expect(decodeVeDirectField('AC_OUT_V', '23015')).to.deep.equal({ AC_OUT_V: 230.15 });
        expect(decodeVeDirectField('AC_OUT_I', '125')).to.deep.equal({ AC_OUT_I: 12.5 });
        expect(decodeVeDirectField('AC_OUT_S', '500')).to.deep.equal({ AC_OUT_S: 500 });
        expect(decodeVeDirectField('DC_IN_V', '24567')).to.deep.equal({ DC_IN_V: 245.67 });
        expect(decodeVeDirectField('DC_IN_I', '103')).to.deep.equal({ DC_IN_I: 10.3 });
        expect(decodeVeDirectField('DC_IN_P', '250')).to.deep.equal({ DC_IN_P: 250 });
    });

    it('ignores unknown fields, including inherited object property names', () => {
        for (const label of ['X_NEW', 'toString', 'constructor', '__proto__', 'hasOwnProperty', 'valueOf']) {
            expect(decodeVeDirectField(label, '123'), label).to.equal(null);
        }
    });
});
