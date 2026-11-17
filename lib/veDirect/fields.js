'use strict';

// VE.Direct Protocol 3.34. Keep the existing state IDs and ioBroker metadata,
// while performing all value conversion in this byte parser's field layer.
const stateAttr = require('../stateAttr.js');
const AlarmReasons = require('../AlarmReasons.js');
const BleReasons = require('../BleReasons.js');
const DeviceModes = require('../DeviceModes.js');
const ErrorNames = require('../ErrorNames.js');
const MonitorTypes = require('../MonitorTypes.js');
const MpptModes = require('../MpptModes.js');
const OffReasons = require('../OffReasons.js');
const OperationStates = require('../OperationStates.js');
const ProductNames = require('../ProductNames.js');

const DECIMAL_INTEGER = /^[+-]?\d+$/;
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function invalidNumeric(value) {
    return new Error(`Invalid numeric value: ${value}`);
}

function numeric(scale = 1) {
    return value => {
        if (value === '---') {
            return null;
        }
        if (!DECIMAL_INTEGER.test(value)) {
            throw invalidNumeric(value);
        }
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            throw invalidNumeric(value);
        }
        const converted = Number((parsed * scale).toFixed(12));
        if (!Number.isFinite(converted)) {
            throw invalidNumeric(value);
        }
        return converted;
    };
}

function text(value) {
    return value;
}

function onOff(value) {
    const normalized = value.toLowerCase();
    if (normalized !== 'on' && normalized !== 'off') {
        throw new Error(`Invalid ON/OFF value: ${value}`);
    }
    // Keep the historic ioBroker state type, but canonicalize the spelling.
    return normalized.toUpperCase();
}

function define(id, decode, overrides = {}) {
    const attr = stateAttr[id] || {};
    return {
        id,
        type: overrides.type || attr.type || 'string',
        role: overrides.role || attr.role || 'state',
        unit: overrides.unit !== undefined ? overrides.unit : attr.unit || '',
        label: overrides.label || attr.name || id,
        descr: overrides.descr || attr.name || id,
        expire: overrides.expire !== undefined ? overrides.expire : attr.expire === true,
        decode,
    };
}

function defineValue(id, decoder, overrides = {}) {
    return define(id, value => ({ [id]: decoder(value) }), overrides);
}

function numericField(id, scale = 1, overrides = {}) {
    return defineValue(id, numeric(scale), overrides);
}

function textField(id, overrides = {}) {
    return defineValue(id, text, overrides);
}

function decimalKey(value) {
    if (!DECIMAL_INTEGER.test(value)) {
        throw invalidNumeric(value);
    }
    return BigInt(value).toString();
}

function tableDecoder(table, property, unknownPrefix) {
    return value => {
        const key = decimalKey(value);
        if (hasOwn(table, key) && table[key] && typeof table[key][property] === 'string') {
            return table[key][property];
        }
        return `${unknownPrefix} = ${value}`;
    };
}

function tableField(id, table, property, unknownPrefix, overrides = {}) {
    return defineValue(id, tableDecoder(table, property, unknownPrefix), overrides);
}

function normalizeHexPid(value) {
    if (!/^0x[0-9a-f]+$/i.test(value)) {
        return null;
    }
    const digits = value.slice(2).replace(/^0+(?=[0-9a-f])/i, '');
    return `0x${digits.toUpperCase()}`;
}

// ProductNames.js predates protocol 3.34. These local additions deliberately
// leave the legacy table untouched.
const PRODUCT_NAMES_334 = Object.assign(Object.create(null), {
    '0xA080': 'SmartSolar MPPT 250|60 rev3',
    '0xA081': 'SmartSolar MPPT 250|70 rev3',
    '0xA3F0': 'Orion XS 12V/12V-50A',
    '0xA3F1': 'Orion XS 1400',
});

function productName(value) {
    const normalized = normalizeHexPid(value);
    if (normalized !== null) {
        if (hasOwn(PRODUCT_NAMES_334, normalized)) {
            return PRODUCT_NAMES_334[normalized];
        }
        if (hasOwn(ProductNames, normalized) && ProductNames[normalized]) {
            return ProductNames[normalized].pid;
        }
    }
    return `unknown PID = ${value}`;
}

function nonNegativeBitField(value, allowHex) {
    const hexadecimal = allowHex && /^0x[0-9a-f]+$/i.test(value);
    if (!hexadecimal && !DECIMAL_INTEGER.test(value)) {
        throw invalidNumeric(value);
    }
    const bits = BigInt(value);
    if (bits < 0n) {
        throw invalidNumeric(value);
    }
    return bits;
}

function bitFieldDecoder(table, unknownPrefix, allowHex = false) {
    const knownBits = /** @type {Array<[bigint, string]>} */ ([]);
    let zeroText;
    for (const [key, entry] of Object.entries(table)) {
        // BigInt also parses the malformed, over-padded hexadecimal keys in the
        // legacy OffReasons table correctly (for example 0x000000010).
        const bit = BigInt(key);
        if (bit === 0n) {
            zeroText = entry.reason;
        } else {
            knownBits.push([bit, entry.reason]);
        }
    }
    knownBits.sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0));

    return value => {
        let remaining = nonNegativeBitField(value, allowHex);
        if (remaining === 0n && zeroText !== undefined) {
            return zeroText;
        }
        const reasons = [];
        for (const [bit, reason] of knownBits) {
            if ((remaining & bit) !== 0n) {
                reasons.push(reason);
                remaining &= ~bit;
            }
        }
        if (remaining !== 0n) {
            reasons.push(`${unknownPrefix} = ${remaining.toString()}`);
        }
        return reasons.join(', ');
    };
}

function hexOrDecimalTableDecoder(table, property, unknownPrefix) {
    const normalizedTable = Object.create(null);
    for (const [key, entry] of Object.entries(table)) {
        normalizedTable[BigInt(key).toString()] = entry;
    }
    return value => {
        const bits = nonNegativeBitField(value, true);
        const key = bits.toString();
        if (hasOwn(normalizedTable, key) && typeof normalizedTable[key][property] === 'string') {
            return normalizedTable[key][property];
        }
        return `${unknownPrefix} = ${value}`;
    };
}

const fields = [
    numericField('V', 0.001, { descr: 'Main or channel 1 battery voltage, transmitted in mV' }),
    numericField('V2', 0.001, { descr: 'Channel 2 battery voltage, transmitted in mV' }),
    numericField('V3', 0.001, { descr: 'Channel 3 battery voltage, transmitted in mV' }),
    numericField('VS', 0.001, { descr: 'Auxiliary/starter voltage, transmitted in mV' }),
    numericField('VM', 0.001, { descr: 'Mid-point voltage, transmitted in mV' }),
    numericField('DM', 0.1, { descr: 'Mid-point deviation, transmitted in per mille' }),
    numericField('VPV', 0.001, { descr: 'Panel voltage, transmitted in mV' }),
    numericField('PPV', 1, { descr: 'Panel power in watts' }),
    numericField('I', 0.001, { descr: 'Signed main battery current, transmitted in mA' }),
    numericField('I2', 0.001, { descr: 'Channel 2 battery current, transmitted in mA' }),
    numericField('I3', 0.001, { descr: 'Channel 3 battery current, transmitted in mA' }),
    numericField('IL', 0.001, { descr: 'Load current, transmitted in mA' }),
    defineValue('LOAD', onOff, { descr: 'Case-insensitive ON/OFF load output state' }),
    numericField('T', 1, { descr: 'Battery temperature; null when no sensor is connected' }),
    numericField('P', 1, { descr: 'Signed instantaneous power in watts' }),
    numericField('CE', 0.001, { descr: 'Consumed amp-hours, transmitted in mAh' }),
    numericField('SOC', 0.1, { descr: 'State of charge, transmitted in per mille' }),
    define(
        'TTG',
        value => {
            if (value === '---') {
                return { TTG: null, TTGInfinite: null };
            }
            const minutes = numeric(1)(value);
            if (minutes === -1) {
                return { TTG: null, TTGInfinite: true };
            }
            if (minutes === null || minutes < 0) {
                throw new Error(`Invalid TTG value: ${value}`);
            }
            return { TTG: minutes, TTGInfinite: false };
        },
        { descr: 'Time to go in minutes; -1 means infinite' },
    ),
    defineValue(
        'TTGInfinite',
        value => {
            if (value !== 'true' && value !== 'false') {
                throw new Error(`Invalid TTGInfinite value: ${value}`);
            }
            return value === 'true';
        },
        {
            type: 'boolean',
            role: 'state',
            unit: '',
            label: 'Time-to-go is infinite',
            descr: 'Synthetic status derived from TTG',
            expire: true,
        },
    ),
    defineValue('Alarm', onOff, { descr: 'Case-insensitive ON/OFF alarm condition' }),
    defineValue('Relay', onOff, { descr: 'Case-insensitive ON/OFF relay state' }),
    defineValue('AR', bitFieldDecoder(AlarmReasons, 'unknown alarm reason'), {
        descr: 'Comma-separated active alarm-reason bits and unknown remainder',
    }),
    defineValue('OR', bitFieldDecoder(OffReasons, 'unknown off reason', true), {
        descr: 'Comma-separated active off-reason bits and unknown remainder',
    }),
    // H1-H3 intentionally remain raw mAh values for state compatibility.
    numericField('H1', 1, { descr: 'Depth of the deepest discharge, raw mAh' }),
    numericField('H2', 1, { descr: 'Depth of the latest discharge, raw mAh' }),
    numericField('H3', 1, { descr: 'Depth of the average discharge, raw mAh' }),
    numericField('H4'),
    numericField('H5'),
    numericField('H6', 0.001, { descr: 'Cumulative amp-hours drawn, transmitted in mAh' }),
    numericField('H7', 0.001, { descr: 'Minimum main battery voltage, transmitted in mV' }),
    numericField('H8', 0.001, { descr: 'Maximum main battery voltage, transmitted in mV' }),
    numericField('H9', 1, { descr: 'Seconds since the last full charge' }),
    numericField('H10'),
    numericField('H11'),
    numericField('H12'),
    numericField('H13'),
    numericField('H14'),
    numericField('H15', 0.001, { unit: 'V', descr: 'Minimum auxiliary voltage, transmitted in mV' }),
    numericField('H16', 0.001, { unit: 'V', descr: 'Maximum auxiliary voltage, transmitted in mV' }),
    numericField('H17', 0.01, { role: 'value.energy', unit: 'kWh' }),
    numericField('H18', 0.01, { role: 'value.energy', unit: 'kWh' }),
    numericField('H19', 0.01, { role: 'value.energy', unit: 'kWh' }),
    numericField('H20', 0.01, { role: 'value.energy', unit: 'kWh' }),
    numericField('H21'),
    numericField('H22', 0.01, { role: 'value.energy', unit: 'kWh' }),
    numericField('H23'),
    tableField('ERR', ErrorNames, 'error', 'unknown error state'),
    tableField('CS', OperationStates, 'state', 'unknown operation state'),
    textField('BMV'),
    textField('FW', { type: 'string', descr: '16-bit firmware version, preserved verbatim' }),
    textField('FWE', { type: 'string', descr: '24-bit firmware version, preserved verbatim' }),
    defineValue('PID', productName, { descr: 'Long product name resolved from a normalized hexadecimal PID' }),
    textField('SER#'),
    numericField('HSDS'),
    tableField('MODE', DeviceModes, 'mode', 'unknown device mode'),
    numericField('AC_OUT_V', 0.01, { descr: 'AC output voltage, transmitted in 0.01 V' }),
    numericField('AC_OUT_I', 0.1, { descr: 'AC output current, transmitted in 0.1 A' }),
    numericField('AC_OUT_S'),
    defineValue('WARN', bitFieldDecoder(AlarmReasons, 'unknown alarm reason'), {
        descr: 'Comma-separated active warning-reason bits and unknown remainder',
    }),
    tableField('MPPT', MpptModes, 'mode', 'unknown mppt mode'),
    tableField('MON', MonitorTypes, 'type', 'unknown monitor type'),
    numericField('DC_IN_V', 0.01, { descr: 'DC input voltage, transmitted in 0.01 V' }),
    numericField('DC_IN_I', 0.1, { descr: 'DC input current, transmitted in 0.1 A' }),
    numericField('DC_IN_P', 1, { descr: 'DC input power in integer watts' }),
    defineValue('CAP_BLE', hexOrDecimalTableDecoder(BleReasons, 'reason', 'unknown BLE reason'), {
        type: 'string',
        role: 'text',
        unit: '',
        label: 'BLE switching capabilities',
        descr: 'Decoded BLE switching capability flags',
        expire: false,
    }),
];

const VE_DIRECT_FIELDS = Object.create(null);
for (const field of fields) {
    VE_DIRECT_FIELDS[field.id] = field;
}

/**
 * Decode one protocol record into its state values.
 *
 * @param {string} label Protocol field label.
 * @param {string} value Raw protocol value.
 * @returns {object|null} Decoded values or null for unknown fields.
 */
function decodeVeDirectField(label, value) {
    if (!hasOwn(VE_DIRECT_FIELDS, label)) {
        return null;
    }
    return VE_DIRECT_FIELDS[label].decode(value);
}

module.exports = { VE_DIRECT_FIELDS, decodeVeDirectField };
