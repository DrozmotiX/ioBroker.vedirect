// VE.Direct Protocol Version 3.26 from 27 November 2018
// Classification of all state attributes possible
const state_attrb = {
	'V' : {
		name: 'Main or channel 1 (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	},  
	'V2' : {
		name: 'Channel 2 (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	},     
	'V3' : {
		name: 'Channel 3 (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	},  
	'VS' : {
		name: 'Auxiliary (starter) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	},  
	'VM' : {
		name: 'Mid-Point voltage of the battery Bank',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	},            
	'DM' : {							// Welche ROLE?
		name: 'Mid-Point deviation of the battery bank',
		type: 'number',
		role: 'state',
		unit:  '%'
	}, 
	'VPV' : {
		name: 'Panel voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	}, 
	'PPV' : {
		name: 'Panel power',
		type: 'number',
		role: 'value.power.delivery',
		unit:  'W'
	}, 
	'I' : {
		name: 'Main or channel 1 battery current',
		type: 'number',
		role: 'value.current',
		unit:  'A'
	}, 
	'I2' : {
		name: 'Channel 2 battery current',
		type: 'number',
		role: 'value.current',
		unit:  'A'
	}, 
	'I3' : {
		name: 'Channel 3 battery current',
		type: 'number',
		role: 'value.current',
		unit:  'A'
	}, 
	'IL' : {
		name: 'Load current',
		type: 'number',
		role: 'value.current',
		unit:  'A'
	}, 
	'LOAD' : {							// Welche ROLE?
		name: 'Load output state',
		type: 'boolean',
		role: 'state',
		unit:  ''
	}, 
	'T' : {
		name: 'Battery temperature',
		type: 'number',
		role: 'value.temperature',
		unit:  '°C'
	}, 
	'P' : {
		name: 'Instantaneous power',
		type: 'number',
		role: 'value.power.current',
		unit:  'W'
	}, 
	'CE' : {
		name: 'Consumed Amp Hours',
		type: 'number',
		role: 'value.power.consumption',
		unit:  'Ah'
	}, 
	'SOC' : {
		name: 'State of Charge',
		type: 'number',
		role: 'value.battery',
		unit:  '%'
	}, 
	'TTG' : {							// Welche ROLE?
		name: 'Time to go',
		type: 'number',
		role: 'state',
		unit:  'Minutes'
	}, 
	'Alarm' : {
		name: 'Alarm condition active',
		type: 'boolean',
		role: 'indicator.alarm',
		unit:  ''
	}, 
	'Relay' : {							// Welche ROLE?
		name: 'Relay state',
		type: 'boolean',
		role: 'indicator',
		unit:  ''
	}, 
	'AR' : {							// Welche ROLE?
		name: 'Alarm reason',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'OR' : {							// Welche ROLE?
		name: 'Off reason',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'H1' : {
		name: 'Depth of the deepest discharge',
		type: 'number',
		role: 'value.power.consumption',
		unit:  'mAh'
	}, 
	'H2' : {
		name: 'Depth of the latest discharge',
		type: 'number',
		role: 'value.power.consumption',
		unit:  'mAh'
	}, 
	'H3' : {
		name: 'Depth of the average discharge',
		type: 'number',
		role: 'value.power.consumption',
		unit:  'mAh'
	}, 
	'H4' : {							// Welche ROLE?
		name: 'Number of charge cycles',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H5' : {							// Welche ROLE?
		name: 'Number of full discharges',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H6' : {
		name: 'Cumulative Amp Hours drawn',
		type: 'number',
		role: 'value.power.consumption',
		unit:  'Ah'
	}, 
	'H7' : {
		name: 'Minimum main (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	}, 
	'H8' : {
		name: 'Maximum main (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	}, 
	'H9' : {							// Welche ROLE?
		name: 'Number of seconds since last full charge',
		type: 'number',
		role: 'state',
		unit:  'Seconds'
	}, 
	'H10' : {							// Welche ROLE?
		name: 'Number of automatic syncronizations',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H11' : {							// Welche ROLE?
		name: 'Number of low main voltage alarms',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H12' : {							// Welche ROLE?
		name: 'Number of high main voltage alarms',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H13' : {							// Welche ROLE?
		name: 'Number of low auxilary voltage alarms',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H14' : {							// Welche ROLE?
		name: 'Number of high auxilary voltage alarms',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'H15' : {
		name: 'Minimum auxilary (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'mV'
	}, 
	'H16' : {
		name: 'Maximum auxilary (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'mV'
	}, 
	'H17' : {
		name: 'Amount of discharged energy',
		type: 'number',
		role: 'value.power.consumption',
		unit:  'KWh'
	}, 
	'H18' : {
		name: 'Amount of charged energy',
		type: 'number',
		role: 'value.power.delivery',
		unit:  'KWh'
	}, 
	'H19' : {
		name: 'Yield total (user resettable counter)',
		type: 'number',
		role: 'value.power.delivery',
		unit:  'KWh'
	}, 
	'H20' : {
		name: 'Yield today',
		type: 'number',
		role: 'value.power.delivery',
		unit:  'KWh'
	},
	'H21' : {
		name: 'Maximum power today',
		type: 'number',
		role: 'value.power.current',
		unit:  'W'
	},    
	'H22' : {
		name: 'Yield yesterday',
		type: 'number',
		role: 'value.power.delivery',
		unit:  'KWh'
	},
	'H23' : {
		name: 'Maximum power yesterday',
		type: 'number',
		role: 'value.power.delivery',
		unit:  'W'
	},
	'ERR' : {							// Welche ROLE?
		name: 'Error Code',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'CS' : {							// Welche ROLE?
		name: 'State of operation',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'BMV' : {
		name: 'Model description',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'FW' : {
		name: 'Firmware version (16 bit)',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'FWE' : {
		name: 'Firmware version (24 bit)',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'PID' : {
		name: 'Product ID',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'SER#' : {
		name: 'Serial number',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'HSDS' : {
		name: 'Day sequence number',
		type: 'number',
		role: 'state',
		unit:  ''
	}, 
	'MODE' : {
		name: 'Device mode',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'AC_OUT_V' : {
		name: 'AC output voltage',
		type: 'number',
		role: 'value.voltage',
		unit:  'V'
	}, 
	'AC_OUT_I' : {
		name: 'AC output current',
		type: 'number',
		role: 'value.current',
		unit:  'A'
	}, 
	'AC_OUT_S' : {
		name: 'AC output apparent power',
		type: 'number',
		role: 'value.power.current',
		unit:  'VA'
	}, 
	'WARN' : {
		name: 'Warning reason',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
	'MPPT' : {
		name: 'Tracker operation mode',
		type: 'string',
		role: 'text',
		unit:  ''
	}, 
}


module.exports = state_attrb;
