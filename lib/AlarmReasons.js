// VE.Direct Protocol Version 3.33 from 6 June 2023
// All available Alarm Reasons
const AlarmReasons = {
	'0': { 
		'reason':'Normal Operation'
	},
	'1': { 
		'reason':'Low Voltage'
	},
	'2': { 
		'reason':'High Voltage'
	},
	'4': { 
		'reason':'Low SOC'
	},
	'8': { 
		'reason':'Low Starter Voltage'
	},
	'16': { 
		'reason':'High Starter Voltage'
	},
	'32': { 
		'reason':'Low Temperature'
	},
	'64': { 
		'reason':'High Temperature'
	},
	'128': { 
		'reason':'Mid Voltage'
	},
	'256': { 
		'reason':'Overload'
	},
	'512': { 
		'reason':'DC-Ripple'
	},
	'1024': { 
		'reason':'Low V AC out'
	},
	'2048': { 
		'reason':'High V AC out'
	},
	'4096': { 
		'reason':'Short Circuit'
	},
	'8192': { 
		'reason':'BMS Lockout'
	}
};
module.exports = AlarmReasons;