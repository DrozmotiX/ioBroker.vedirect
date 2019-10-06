'use strict';

/*
 * Created with @iobroker/create-adapter v1.16.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
//const SerialPort = require('serialport');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const state_attr = require(__dirname + '/lib/state_attr.js');

const bmvdata = {};
let client, serialPort;
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
		const useUSB = this.config.byUSB;
		const USB_Device = this.config.USBDevice;


		const port = new SerialPort('/dev/ttyUSB0', {
			baudRate: 19200
		});
		const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
		parser.on('data', (data)  => {

//			this.log.info('test : ' + data);
			this.parse_serial(data);
			this.setState('info.connection', true, true);

		});

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


	async parse_serial(line) {
		this.log.info('Line : ' + line);
		const res = line.split('\t');
//		this.log.debug('Type ' + res[0] +  ' Value : ' + res[1]);
//		this.log.debug('From Library: ' + state_attr[res[0]]);

		if (state_attr[res[0]] !== undefined) {

			await this.setObjectAsync(res[0], {
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
			
			let calc;
			switch(res[0]) {
				case    'V':
					this.log.error('Case V');
					this.setState(res[0], {val: (Math.floor(res[1])/1000)});
					// bmvdata.V = Math.floor(res[1]/10)/100;
					break;
				case    'VS':
					this.setState(res[0], {val: (Math.floor(res[1])/1000)});
					bmvdata.VS = Math.floor(res[1]/10)/100;
					break;
				case    'H20':
					this.setState(res[0], {val: (Math.floor(res[1])/1000)});
					//		bmvdata.H20 = Math.floor(res[1]/10)/100;
					break;
//				case    'I':
//					bmvdata.I = res[1];
//					break;
//				case    'SOC':
//					bmvdata.SOC = res[1]/10;
//					break;
//				case    'CE':
//					bmvdata.CE = res[1];
//					break;
				case    'VPV':
					this.setState(res[0], {val: (Math.floor(res[1])/1000)});
					bmvdata.VPV = Math.floor(res[1]/10)/100;
					break;
//				case    'PPV':
//					bmvdata.PPV = res[1];
//					break;
				case    'PID':
//					bmvdata.PID = res[1];
					this.setState(res[0], {val: await this.get_product_longname(res[1])});
//					bmvdata.LONG = await this.get_product_longname(res[1]);    
					break;
//				case    'H20':
//					bmvdata.YT = res[1];
//					break;
//				case    'H22':
//					bmvdata.YY = res[1];
//					break;
//				case    'BMV':
//					bmvdata.BMV = res[1];
//					bmvdata.LONG = res[1];    
//					break;

				default  :
					this.log.info('No case matched for ' + res[0]);
					this.setState(res[0], {val: res[1]});

			}

		}
				

/*

*/		

	}

	async create_state(name, value){

		await this.setObjectAsync(name, {
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

		this.setState(name, {val: value});


	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			const useUSB = this.config.byUSB;
			const useTCP = this.config.byTCPIP;

			if (useTCP){
				client.end();
			}			
			
			if(useUSB) {
				serialPort.close();
				this.log.info('VE.direct Terminated, all USB connections closed');
			}
			
			// Write message in log related to server connection
			client.on('end', () => {
				// Need to add logic for retry / restart
				this.log.warn('VE.direct : disconnected');
			});

			//	serialPort.on('error', function(error) {
			serialPort.on('close', () => {
				this.log.warn('VE.direct : disconnected');
			});
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires 'common.message' property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }

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