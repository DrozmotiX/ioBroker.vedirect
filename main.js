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

let client, serialPort, polling;

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

			// Open pipe and listen to parser to get data
			const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
			
			parser.on('data', (data)  => {
				this.parse_serial(data);
				// Indicate connection status
				this.setState('info.connection', true, true);
				// Clear running timer
				(function () {if (polling) {clearTimeout(polling); polling = null;}})();
				// timer
				polling = setTimeout( () => {
					// Set time-out on connectin state when 10 seconds no information received
					this.setState('info.connection', false, true);
					this.log.error('No data received for 10 seconds, connection lost ?');
				}, 10000);

			});

			serialPort.on('error', (error) => {
				this.log.error('Issue handling serial port connection : ' + JSON.stringify(error));
			});
		
		} catch (error) {
			this.log.error('Conecting to Vedirect device failed !');
			this.log.error(error);
				
		}

	}

	async parse_serial(line) {
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
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;
					
				case	'H6':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;	
								
				case	'V':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case	'V2':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;	

				case	'V3':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'VS':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;
				
				case    'VM':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;
					
				case    'DM':
					this.setState(res[0], {val: (Math.floor(res[1])/10), ack: true});
					break;

				case    'VPV':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'I':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'I2':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;
				
				case    'I3':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'IL':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'SOC':
					this.setState(res[0], {val: (Math.floor(res[1])/10), ack: true});
					break;
				
				case    'AR':
					this.setState(res[0], {val: await this.get_alarm_reason(res[1]), ack: true});   
					break;
				
				case    'WARN':
					this.setState(res[0], {val: await this.get_alarm_reason(res[1])});   
					break;

				case    'OR':
					this.setState(res[0], {val: await this.get_off_reason(res[1]), ack: true});   
					break;

				case    'H7':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'H8':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'H15':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'H16':
					this.setState(res[0], {val: (Math.floor(res[1])/1000), ack: true});
					break;

				case    'H17':
					this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true});
					break;

				case    'H18':
					this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true});
					break;

				case    'H19':
					this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true});
					break;					

				case    'H20':
					this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true});
					break;

				case    'H22':
					this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true});
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
					this.setState(res[0], {val: (Math.floor(res[1])/100), ack: true});
					break;
				
				case    'AC_OUT_I':
					this.setState(res[0], {val: (Math.floor(res[1])/10), ack: true});
					break;

				case    'MPPT':
					this.setState(res[0], {val: await this.get_mppt_mode(res[1]), ack: true});   
					break;
	
				default  :
					this.log.debug('No case matched for ' + res[0]);
					this.setState(res[0], {val: res[1], ack: true});
			}
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
		this.setState(name, {val: value, ack: true});
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {

		try {
		
			serialPort.close();
			this.log.info('VE.direct Terminated, all USB connections closed');

			// Write message in log related to server connection
			client.on('end', () => {
				// Need to add logic for retry / restart
				this.log.warn('VE.direct : disconnected');
			});

			serialPort.on('error', (error) => {
				this.log.error('Issue handling serial port connection : ' + JSON.stringify(error));
			});

			serialPort.on('close', () => {
				this.log.warn('VE.direct : disconnected');
			});
			callback();
		} catch (e) {
			callback();
		}

	}
	async get_product_longname(pid) {
		if (pid == '0x203') return('BMV-700');
		if (pid == '0x204') return('BMV-702');
		if (pid == '0x205') return('BMV-700H');
		if (pid == '0x300') return('BlueSolar MPPT 70|15');
		if (pid == '0xA040') return('BlueSolar MPPT 75|50');
		if (pid == '0xA041') return('BlueSolar MPPT 150|35');
		if (pid == '0xA042') return('BlueSolar MPPT 75|15');
		if (pid == '0xA043') return('BlueSolar MPPT 100|15');
		if (pid == '0xA044') return('BlueSolar MPPT 100|30');
		if (pid == '0xA045') return('BlueSolar MPPT 100|50');
		if (pid == '0xA046') return('BlueSolar MPPT 150|70');
		if (pid == '0xA047') return('BlueSolar MPPT 150|100');
		if (pid == '0xA049') return('BlueSolar MPPT 100|50 rev2');
		if (pid == '0xA04A') return('BlueSolar MPPT 100|30 rev2');
		if (pid == '0xA04B') return('BlueSolar MPPT 150|35 rev2');
		if (pid == '0xA04C') return('BlueSolar MPPT 75|10');
		if (pid == '0xA04D') return('BlueSolar MPPT 150|45');
		if (pid == '0xA04E') return('BlueSolar MPPT 150|60');
		if (pid == '0xA04F') return('BlueSolar MPPT 150|85');
		if (pid == '0xA050') return('SmartSolar MPPT 250|100');
		if (pid == '0xA051') return('SmartSolar MPPT 150|100');
		if (pid == '0xA052') return('SmartSolar MPPT 150|85');
		if (pid == '0xA053') return('SmartSolar MPPT 75|15');
		if (pid == '0xA054') return('SmartSolar MPPT 75|10');
		if (pid == '0xA055') return('SmartSolar MPPT 100|15');
		if (pid == '0xA056') return('SmartSolar MPPT 100|30');
		if (pid == '0xA057') return('SmartSolar MPPT 100|50');
		if (pid == '0xA058') return('SmartSolar MPPT 150|35');
		if (pid == '0xA059') return('SmartSolar MPPT 150|100 rev2');
		if (pid == '0xA05A') return('SmartSolar MPPT 150|85 rev2');
		if (pid == '0xA05B') return('SmartSolar MPPT 250|70');
		if (pid == '0xA05C') return('SmartSolar MPPT 250|85');
		if (pid == '0xA05D') return('SmartSolar MPPT 250|60');
		if (pid == '0xA05E') return('SmartSolar MPPT 250|45');
		if (pid == '0xA05F') return('SmartSolar MPPT 100|20');
		if (pid == '0xA060') return('SmartSolar MPPT 100|20 48V');
		if (pid == '0xA061') return('SmartSolar MPPT 150|45');
		if (pid == '0xA062') return('SmartSolar MPPT 150|60');
		if (pid == '0xA063') return('SmartSolar MPPT 150|70');
		if (pid == '0xA064') return('SmartSolar MPPT 250|85 rev2');
		if (pid == '0xA065') return('SmartSolar MPPT 250|100 rev2');
		if (pid == '0xA102') return('SmartSolar MPPT VE.Can 150/70');
		if (pid == '0xA103') return('SmartSolar MPPT VE.Can 150/45');
		if (pid == '0xA104') return('SmartSolar MPPT VE.Can 150/60');
		if (pid == '0xA105') return('SmartSolar MPPT VE.Can 150/85');
		if (pid == '0xA106') return('SmartSolar MPPT VE.Can 150/100');
		if (pid == '0xA107') return('SmartSolar MPPT VE.Can 250/45');
		if (pid == '0xA108') return('SmartSolar MPPT VE.Can 250/60');
		if (pid == '0xA109') return('SmartSolar MPPT VE.Can 250/70');
		if (pid == '0xA10A') return('SmartSolar MPPT VE.Can 250/85');
		if (pid == '0xA10B') return('SmartSolar MPPT VE.Can 250/100');
		if (pid == '0xA201') return('Phoenix Inverter 12V 250VA 230V');
		if (pid == '0xA202') return('Phoenix Inverter 24V 250VA 230V');
		if (pid == '0xA204') return('Phoenix Inverter 48V 250VA 230V');
		if (pid == '0xA211') return('Phoenix Inverter 12V 375VA 230V');
		if (pid == '0xA212') return('Phoenix Inverter 24V 375VA 230V');
		if (pid == '0xA214') return('Phoenix Inverter 48V 375VA 230V');
		if (pid == '0xA221') return('Phoenix Inverter 12V 500VA 230V');
		if (pid == '0xA222') return('Phoenix Inverter 24V 500VA 230V');
		if (pid == '0xA224') return('Phoenix Inverter 48V 500VA 230V');
		if (pid == '0xA231') return('Phoenix Inverter 12V 250VA 230V');
		if (pid == '0xA232') return('Phoenix Inverter 24V 250VA 230V');
		if (pid == '0xA234') return('Phoenix Inverter 48V 250VA 230V');
		if (pid == '0xA239') return('Phoenix Inverter 12V 250VA 120V');
		if (pid == '0xA23A') return('Phoenix Inverter 24V 250VA 120V');
		if (pid == '0xA23C') return('Phoenix Inverter 48V 250VA 120V');
		if (pid == '0xA241') return('Phoenix Inverter 12V 375VA 230V');
		if (pid == '0xA242') return('Phoenix Inverter 24V 375VA 230V');
		if (pid == '0xA244') return('Phoenix Inverter 48V 375VA 230V');
		if (pid == '0xA249') return('Phoenix Inverter 12V 375VA 120V');
		if (pid == '0xA24A') return('Phoenix Inverter 24V 375VA 120V');
		if (pid == '0xA24C') return('Phoenix Inverter 48V 375VA 120V');
		if (pid == '0xA251') return('Phoenix Inverter 12V 500VA 230V');
		if (pid == '0xA252') return('Phoenix Inverter 24V 500VA 230V');
		if (pid == '0xA254') return('Phoenix Inverter 48V 500VA 230V');
		if (pid == '0xA259') return('Phoenix Inverter 12V 500VA 120V');
		if (pid == '0xA25A') return('Phoenix Inverter 24V 500VA 120V');
		if (pid == '0xA25C') return('Phoenix Inverter 48V 500VA 120V');
		if (pid == '0xA261') return('Phoenix Inverter 12V 800VA 230V');
		if (pid == '0xA262') return('Phoenix Inverter 24V 800VA 230V');
		if (pid == '0xA264') return('Phoenix Inverter 48V 800VA 230V');
		if (pid == '0xA269') return('Phoenix Inverter 12V 800VA 120V');
		if (pid == '0xA26A') return('Phoenix Inverter 24V 800VA 120V');
		if (pid == '0xA26C') return('Phoenix Inverter 48V 800VA 120V');
		if (pid == '0xA271') return('Phoenix Inverter 12V 1200VA 230V');
		if (pid == '0xA272') return('Phoenix Inverter 24V 1200VA 230V');
		if (pid == '0xA274') return('Phoenix Inverter 48V 1200VA 230V');
		if (pid == '0xA279') return('Phoenix Inverter 12V 1200VA 120V');
		if (pid == '0xA27A') return('Phoenix Inverter 24V 1200VA 120V');
		if (pid == '0xA27C') return('Phoenix Inverter 48V 1200VA 120V');
		if (pid == '0xA281') return('Phoenix Inverter 12V 1600VA 230V');
		if (pid == '0xA282') return('Phoenix Inverter 24V 1600VA 230V');
		if (pid == '0xA284') return('Phoenix Inverter 48V 1600VA 230V');
		if (pid == '0xA291') return('Phoenix Inverter 12V 2000VA 230V');
		if (pid == '0xA292') return('Phoenix Inverter 24V 2000VA 230V');
		if (pid == '0xA294') return('Phoenix Inverter 48V 2000VA 230V');
		if (pid == '0xA2A1') return('Phoenix Inverter 12V 3000VA 230V');
		if (pid == '0xA2A2') return('Phoenix Inverter 24V 3000VA 230V');
		if (pid == '0xA2A4') return('Phoenix Inverter 48V 3000VA 230V');
		if (pid == '0xA340') return('Phoenix Smart IP43 Charger 12|50 (1+1)');
		if (pid == '0xA341') return('Phoenix Smart IP43 Charger 12|50 (3)');
		if (pid == '0xA342') return('Phoenix Smart IP43 Charger 24|25 (1+1)');
		if (pid == '0xA343') return('Phoenix Smart IP43 Charger 24|25 (3)');
		if (pid == '0xA344') return('Phoenix Smart IP43 Charger 12|30 (1+1)');
		if (pid == '0xA345') return('Phoenix Smart IP43 Charger 12|30 (3)');
		if (pid == '0xA346') return('Phoenix Smart IP43 Charger 24|16 (1+1)');
		if (pid == '0xA347') return('Phoenix Smart IP43 Charger 24|16 (3)');
		return ('Unknown');
	}

	async get_alarm_reason(ar) {
		if (ar == '0') return('Normal Operation');
		if (ar == '1') return('Low Voltage');
		if (ar == '2') return('High Voltage');
		if (ar == '4') return('Low SOC');
		if (ar == '8') return('Low Starter Voltage');
		if (ar == '16') return('High Starter Voltage');
		if (ar == '32') return('Low Temperature');
		if (ar == '64') return('High Temperature');
		if (ar == '128') return('Mid Voltage');
		if (ar == '256') return('Overload');
		if (ar == '512') return('DC-Ripple');
		if (ar == '1024') return('Low V AC out');
		if (ar == '2048') return('High V AC out');
		if (ar == '4096') return('Short Circuit');
		if (ar == '8192') return('BMS Lockout');
		return ('Unknown');
	}

	async get_off_reason(or) {
		if (or == '0x00000000') return('Normal Operation');
		if (or == '0x00000001') return('No input power');
		if (or == '0x00000002') return('Switched off (power switch');
		if (or == '0x00000004') return('Switched off (device mode register');
		if (or == '0x00000008') return('Remote input');
		if (or == '0x000000010') return('Protection active');
		if (or == '0x000000020') return('Paygo');
		if (or == '0x000000040') return('BMS');
		if (or == '0x000000080') return('Engine shutdown detection');
		if (or == '0x000000100') return('Analysing input voltage');
		return ('Unknown');
	}

	async get_cap_ble(ble) {
		if (ble == '0x00000001') return('BLE supports switching off');
		if (ble == '0x00000002') return('BLE switching off is permanent');
		return ('Unknown');
	}

	async get_cs_state(cs) {
		if (cs == '0') return('Off');
		if (cs == '1') return('Low power / Load search');
		if (cs == '2') return('Fault');
		if (cs == '3') return('Bulk');
		if (cs == '4') return('Absorption');
		if (cs == '5') return('Float');
		if (cs == '6') return('Storage');
		if (cs == '7') return('Equalize (manual)');
		if (cs == '9') return('Inverting');
		if (cs == '11') return('Power Supply');
		if (cs == '245') return('Starting-Up');
		if (cs == '246') return('Repeated absorption');
		if (cs == '247') return('Auto equalize / Recondition');
		if (cs == '248') return('Battery Safe');
		if (cs == '252') return('External Control');
		return ('Unknown');
	}

	async get_err_state(err) {
		if (err == '0') return('No Error');
		if (err == '2') return('Battery voltage too high');
		if (err == '17') return('Charger temperature too high');
		if (err == '18') return('Charger overcurrent');
		if (err == '19') return('Charger current reversed');
		if (err == '20') return('Bulk time limit exceeded');
		if (err == '21') return('Current sensor issue (sensor bias / sensor broken)');
		if (err == '26') return('terminals overheated');
		if (err == '28') return('Converter issue (dual converter models only)');
		if (err == '33') return('Input voltage too high (solar panel)');
		if (err == '34') return('Input current too high (solar panel)');
		if (err == '38') return('Input shutdown (due to excessive battery voltage)');
		if (err == '39') return('Input shutdown (due to current flow during off mode');
		if (err == '65') return('Lost communication with one of devices');
		if (err == '66') return('Syncronised charging device configuration issue');
		if (err == '67') return('BMS connection lost');
		if (err == '68') return('Network misconfigured');
		if (err == '116') return('Factory calibration data lost');
		if (err == '117') return('Invalid or incompatible firmware');
		if (err == '119') return('User settings invalid');
		return ('Unknown');
	}
	
	async get_device_mode(mode) {
		if (mode == '1') return('VE_REG_MODE_CHARGER');
		if (mode == '2') return('VE_REG_MODE_INVERTER');
		if (mode == '4') return('VE_REG_MODE_OFF');
		if (mode == '5') return('VE_REG_MODE_ECO');
		if (mode == '253') return('VE_REG_MODE_HIBERNATE');
		return ('Unknown');
	}

	async get_mppt_mode(mppt) {
		if (mppt == '0') return('Off');
		if (mppt == '1') return('Voltage or current limited');
		if (mppt == '2') return('MPP Tracker active');
		return ('Unknown');
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
