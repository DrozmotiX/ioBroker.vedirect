// VE.Direct Protocol Version 3.33 from 6 June 2023
// All available MPPT Modes
const MpptModes = {
	'0': { 
		'mode':'Off'
	},
	'1': { 
		'mode':'Voltage or current limited'
	},
	'2': { 
		'mode':'MPP Tracker active'
	}
};
module.exports = MpptModes;