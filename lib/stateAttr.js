// VE.Direct Protocol Version 3.32 from 30 June 2021
// Classification of all state attributes possible
const state_attrb = {
	'V' : {
		name: 'Main or channel 1 (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	},  
	'V2' : {
		name: 'Channel 2 (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
		
	},     
	'V3' : {
		name: 'Channel 3 (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	},  
	'VS' : {
		name: 'Auxiliary (starter) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	},  
	'VM' : {
		name: 'Mid-Point voltage of the battery Bank',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	},            
	'DM' : {		
		name: 'Mid-Point deviation of the battery bank',
		type: 'number',
		role: 'value',
		unit: '%',
		expire: true
	}, 
	'VPV' : {
		name: 'Panel voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	}, 
	'PPV' : {
		name: 'Panel power',
		type: 'number',
		role: 'value.power.delivery',
		unit: 'W',
		expire: true
	}, 
	'I' : {
		name: 'Main or channel 1 battery current',
		type: 'number',
		role: 'value.current',
		unit: 'A',
		expire: true
	}, 
	'I2' : {
		name: 'Channel 2 battery current',
		type: 'number',
		role: 'value.current',
		unit: 'A',
		expire: true
	}, 
	'I3' : {
		name: 'Channel 3 battery current',
		type: 'number',
		role: 'value.current',
		unit: 'A',
		expire: true
	}, 
	'IL' : {
		name: 'Load current',
		type: 'number',
		role: 'value.current',
		unit: 'A',
		expire: true
	}, 
	'LOAD' : {							// Datentyp? eigentlich On / OFF als text aber man könnte auch boolean Datentyp draus machen aber dann ist es nicht mehr der Name so wie er in der Protokollbeschreibung steht
		name: 'Load output state',
		type: 'string',
		role: 'indicator',
		unit: '',
		expire: true
	}, 
	'T' : {
		name: 'Battery temperature',
		type: 'number',
		role: 'value.temperature',
		unit: '°C',
		expire: true
	}, 
	'P' : {
		name: 'Instantaneous power',
		type: 'number',
		role: 'value.power.current',
		unit: 'W',
		expire: true
	}, 
	'CE' : {
		name: 'Consumed Amp Hours',
		type: 'number',
		role: 'value.power.consumption',
		unit: 'Ah',
		expire: true
	}, 
	'SOC' : {
		name: 'State of Charge',
		type: 'number',
		role: 'value.battery',
		unit: '%',
		expire: true
	}, 
	'TTG' : {							// Welche ROLE? gibt keine Minuten und sekunden als role in IoBroker
		name: 'Time to go',
		type: 'number',
		role: 'value',
		unit: 'Minutes',
		expire: true
	}, 
	'Alarm' : {
		name: 'Alarm condition active',
		type: 'string',
		role: 'indicator.alarm',
		unit: '',
		expire: false
	}, 
	'Relay' : {							// Welche ROLE?
		name: 'Relay state',
		type: 'string',
		role: 'indicator',
		unit: '',
		expire: true
	}, 
	'AR' : {							// Welche ROLE? kommt als String und muss ein String bleiben da dies der Grund für den Alarm ist
		name: 'Alarm reason',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'OR' : {							// Welche ROLE? kommt als String und muss ein String bleiben da dies der Grund für den Abschaltgrund ist
		name: 'Off reason',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'H1' : {
		name: 'Depth of the deepest discharge',
		type: 'number',
		role: 'value.power.consumption',
		unit: 'mAh',
		expire: true
	}, 
	'H2' : {
		name: 'Depth of the latest discharge',
		type: 'number',
		role: 'value.power.consumption',
		unit: 'mAh',
		expire: true
	}, 
	'H3' : {
		name: 'Depth of the average discharge',
		type: 'number',
		role: 'value.power.consumption',
		unit: 'mAh',
		expire: true
	}, 
	'H4' : {							// Welche ROLE?  cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of charge cycles',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H5' : {							// Welche ROLE?  cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of full discharges',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H6' : {
		name: 'Cumulative Amp Hours drawn',
		type: 'number',
		role: 'value.power.consumption',
		unit: 'Ah',
		expire: true
	}, 
	'H7' : {
		name: 'Minimum main (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	}, 
	'H8' : {
		name: 'Maximum main (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	}, 
	'H9' : {							// Welche ROLE? wenn es sekunden geben würde!!
		name: 'Number of seconds since last full charge',
		type: 'number',
		role: 'value',
		unit: 'Seconds',
		expire: true
	}, 
	'H10' : {							// Welche ROLE? cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of automatic syncronizations',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H11' : {							// Welche ROLE? cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of low main voltage alarms',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H12' : {							// Welche ROLE? cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of high main voltage alarms',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H13' : {							// Welche ROLE? cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of low auxilary voltage alarms',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H14' : {							// Welche ROLE? cycles (wie oft dieser Zustand eingetreten ist)
		name: 'Number of high auxilary voltage alarms',
		type: 'number',
		role: 'value',
		unit: 'Cycles',
		expire: true
	}, 
	'H15' : {
		name: 'Minimum auxilary (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'mV',
		expire: true
	}, 
	'H16' : {
		name: 'Maximum auxilary (battery) voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'mV',
		expire: true
	}, 
	'H17' : {
		name: 'Amount of discharged energy',
		type: 'number',
		role: 'value.power.consumption',
		unit: 'KWh',
		expire: true
	}, 
	'H18' : {
		name: 'Amount of charged energy',
		type: 'number',
		role: 'value.power.delivery',
		unit: 'KWh',
		expire: true
	}, 
	'H19' : {
		name: 'Yield total (user resettable counter)',
		type: 'number',
		role: 'value.power.delivery',
		unit: 'KWh',
		expire: true
	}, 
	'H20' : {
		name: 'Yield today',
		type: 'number',
		role: 'value.power.delivery',
		unit: 'KWh',
		expire: true
	},
	'H21' : {
		name: 'Maximum power today',
		type: 'number',
		role: 'value.power.current',
		unit: 'W',
		expire: false
	},    
	'H22' : {
		name: 'Yield yesterday',
		type: 'number',
		role: 'value.power.delivery',
		unit: 'KWh',
		expire: false
	},
	'H23' : {
		name: 'Maximum power yesterday',
		type: 'number',
		role: 'value.power.delivery',
		unit: 'W',
		expire: false
	},
	'ERR' : {
		name: 'Error Code',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'CS' : {
		name: 'State of operation',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'BMV' : {
		name: 'Model description',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'FW' : {
		name: 'Firmware version (16 bit)',
		type: 'number',
		role: 'state',
		unit: '',
		expire: false
	}, 
	'FWE' : {
		name: 'Firmware version (24 bit)',
		type: 'number',
		role: 'state',
		unit: '',
		expire: false
	}, 
	'PID' : {
		name: 'Product ID',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'SER#' : {
		name: 'Serial number',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'HSDS' : { 
		name: 'Day sequence number',
		type: 'number',
		role: 'value',
		unit: 'Days',
		expire: true
	}, 
	'MODE' : {
		name: 'Device mode',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'AC_OUT_V' : {
		name: 'AC output voltage',
		type: 'number',
		role: 'value.voltage',
		unit: 'V',
		expire: true
	}, 
	'AC_OUT_I' : {
		name: 'AC output current',
		type: 'number',
		role: 'value.current',
		unit: 'A',
		expire: true
	}, 
	'AC_OUT_S' : {
		name: 'AC output apparent power',
		type: 'number',
		role: 'value.power.current',
		unit: 'VA',
		expire: true
	}, 
	'WARN' : {
		name: 'Warning reason',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
	'MPPT' : {
		name: 'Tracker operation mode',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	},
	'MON' : {
		name: 'DC monitor mode',
		type: 'string',
		role: 'text',
		unit: '',
		expire: false
	}, 
}
module.exports = state_attrb;
