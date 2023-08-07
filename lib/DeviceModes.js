// VE.Direct Protocol Version 3.33 from 6 June 2023
// All available Device Modes
const DeviceModes = {
	'1': { 
		'mode':'VE_REG_MODE_CHARGER'
	},
	'2': { 
		'mode':'VE_REG_MODE_INVERTER'
	},
	'4': { 
		'mode':'VE_REG_MODE_OFF'
	},
	'5': { 
		'mode':'VE_REG_MODE_ECO'
	},
	'253': { 
		'mode':'VE_REG_MODE_HIBERNATE'
	}
};
module.exports = DeviceModes;