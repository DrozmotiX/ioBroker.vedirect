// VE.Direct Protocol Version 3.26 from 27 November 2018
// All available Off Reasons
const OffReasons = {
	'0x00000000': { 
		'reason':'Normal Operation'
		},
	'0x00000001': { 
		'reason':'No input power'
		},
	'0x00000002': { 
			'reason':'Switched off (power switch'
		},
	'0x00000004': { 
		'reason':'Switched off (device mode register'
	},
	'0x00000008': { 
		'reason':'Remote input'
	},
	'0x000000010': { 
		'reason':'Protection active'
	},
	'0x000000020': { 
		'reason':'Paygo'
	},
	'0x000000040': { 
		'reason':'BMS'
	},
	'0x000000080': { 
		'reason':'Engine shutdown detection'
	},
	'0x000000100': { 
		'reason':'Analysing input voltage'
	}
}

module.exports = OffReasons;