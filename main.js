'use strict';

/*
 * Created with @iobroker/create-adapter v1.16.0
 	VE.Direct Protocol Version 3.26 from 27 November 2018
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
// Load your modules here, e.g.:
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const state_attr = require(__dirname + '/lib/state_attr.js');
const ProductNames = require(__dirname + '/lib/ProductNames.js');
const ErrorNames = require(__dirname + '/lib/ErrorNames.js');
const AlarmReasons = require(__dirname + '/lib/AlarmReasons.js');
const OperationStates = require(__dirname + '/lib/OperationStates.js');
const OffReasons = require(__dirname + '/lib/OffReasons.js');
const DeviceModes = require(__dirname + '/lib/DeviceModes.js');
const MpptModes = require(__dirname + '/lib/MpptModes.js');
const BleReasons = require(__dirname + '/lib/BleReasons.js');
let client, polling, parser;

class Vedirect extends utils.Adapter {
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'vedirect',
		});
		this.on('ready', this.onReady.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('stateChange', this.onStateChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.setState('info.connection', false, true);

		try {

			// Open Serial port connection
			const USB_Device = this.config.USBDevice;
			const port = new SerialPort(USB_Device, {
				baudRate: 19200
			});

			port.on('error', (error) => {
				this.log.error('Issue handling serial port connection : ' + JSON.stringify(error));
				this.setState('info.connection', false, true);
			});


			// Open pipe and listen to parser to get data
			parser = port.pipe(new Readline({ delimiter: '\r\n' }));

			parser.on('data', (data)  => {
				this.parse_serial(data);
				// Indicate connection status
				this.setState('info.connection', true, true);
				// Clear running timer
				(function () {if (polling) {clearTimeout(polling); polling = null;}})();
				// timer
				polling = setTimeout( () => {
					// Set time-out on connecting state when 10 seconds no information received
					this.setState('info.connection', false, true);
					this.log.error('No data received for 10 seconds, connection lost ?');
				}, 10000);

			});

			parser.on('error', (error) => {
				this.log.error('Issue handling serial port connection : ' + JSON.stringify(error));
				this.setState('info.connection', false, true);
			});

		} catch (error) {
			this.log.error('Connection to Vedirect device failed !');
			this.setState('info.connection', false, true);
			this.log.error(error);

		}
	}

	async parse_serial(line) {
		try {

			this.log.debug('Line : ' + line);
			const res = line.split('\t');
			if (state_attr[res[0]] !== undefined) {
				await this.setObjectNotExistsAsync(res[0], {
					type: 'state',
					common: {
						name: state_attr[res[0]].name,
						type: state_attr[res[0]].type,
						role: state_attr[res[0]].role,
						unit: state_attr[res[0]].unit,
						read: true,
						write: false
					},
					native: {},
				});

				switch(res[0]) {
					case	'CE':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case	'V':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case	'V2':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case	'V3':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'VS':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'VM':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'DM':
						this.setState(res[0], {val: (Math.floor(res[1])/10), ack: true, expire : 2});
						break;

					case    'VPV':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'I':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'I2':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'I3':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'IL':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'SOC':
						this.setState(res[0], {val: (Math.floor(res[1])/10), ack: true, expire : 2});
						break;

					case    'AR':
						this.setState(res[0], {val: await this.get_alarm_reason(res[1]), ack: true});
						break;

					case    'WARN':
						this.setState(res[0], {val: await this.get_alarm_reason(res[1]), ack: true});
						break;

					case    'OR':
						this.setState(res[0], {val: await this.get_off_reason(res[1]), ack: true});
						break;

					case	'H6':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'H7':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'H8':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'H15':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'H16':
						this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true, expire : 2});
						break;

					case    'H17':
						this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true, expire : 2});
						break;

					case    'H18':
						this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true, expire : 2});
						break;

					case    'H19':
						this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true, expire : 2});
						break;

					case    'H20':
						this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true, expire : 2});
						break;

					case    'H22':
						this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true, expire : 2});
						break;

					case    'ERR':
						this.setState(res[0], {val: await this.get_err_state(res[1]), ack: true});
						break;

					case    'CS':
						this.setState(res[0], {val: await this.get_cs_state(res[1]), ack: true});
						break;

					case    'PID':
						this.setState(res[0], {val: await this.get_product_longname(res[1]), ack: true});
						break;

					case    'MODE':
						this.setState(res[0], {val: await this.get_device_mode(res[1]), ack: true});
						break;

					case    'AC_OUT_V':
						this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true, expire : 2});
						break;

					case    'AC_OUT_I':
						this.setState(res[0], {val: (Math.floor(res[1])/10), ack: true, expire : 2});
						break;

					case    'MPPT':
						this.setState(res[0], {val: await this.get_mppt_mode(res[1]), ack: true, expire : 2});
						break;

					default  :
						this.log.debug('No case matched for ' + res[0]);
						this.setState(res[0], {val: res[1], ack: true});
				}
			}


		} catch (error) {
			this.log.error('Connection to Vedirect device failed !');
			this.setState('info.connection', false, true);
			this.log.error(error);

		}
	}

	async create_state(name, value){
		await this.setObjectNotExistsAsync(name, {
			type: 'state',
			common: {
				name: name,
				type: 'number',
				role: 'state',
				read: true,
				write: false,
			},
			native: {},
		});
		this.setState(name, {val: value, ack: true, expire : 2});
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		this.setState('info.connection', false, true);
		try {

			SerialPort.close();
			this.log.info('VE.direct Terminated, all USB connections closed');

			// Write message in log related to server connection
			client.on('end', () => {
				this.setState('info.connection', false, true);
				// Need to add logic for retry / restart
				this.log.warn('VE.direct : disconnected');
			});

			parser.on('error', (error) => {
				this.setState('info.connection', false, true);
				this.log.error('Issue handling serial port connection : ' + JSON.stringify(error));
			});

			parser.on('close', () => {
				this.setState('info.connection', false, true);
				this.log.warn('VE.direct : disconnected');
			});
			callback();
		} catch (e) {
			callback();
		}
	}
	async get_product_longname(pid) {
		let name = null;
		try {
			name = ProductNames[pid].pid;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_alarm_reason(ar) {
		let name = null;
		try {
			name = AlarmReasons[ar].reason;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_off_reason(or) {
		let name = null;
		try {
			name = OffReasons[or].reason;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_cap_ble(ble) {
		let name = null;
		try {
			name = BleReasons[ble].reason;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_cs_state(cs) {
		let name = null;
		try {
			name = OperationStates[cs].state;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_err_state(err) {
		let name = null;
		try {
			name = ErrorNames[err].error;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_device_mode(mode) {
		let name = null;
		try {
			name = DeviceModes[mode].mode;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

	async get_mppt_mode(mppt) {
		let name = null;
		try {
			name = MpptModes[mppt].mode;
		} catch (error) {
			name = 'unknown';
		}
		return name;
	}

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Vedirect(options);
} else {
	// otherwise start the instance directly
	new Vedirect();
}
