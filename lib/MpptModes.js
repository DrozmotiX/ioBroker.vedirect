// VE.Direct Protocol Version 3.26 from 27 November 2018
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
}

module.exports = MpptModes;