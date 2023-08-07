// VE.Direct Protocol Version 3.33 from 6 June 2023
// All available errors
const ErrorNames = {
	'0': { 
		'error':'No Error'
	},
	'2': { 
		'error':'Battery voltage too high'
	},
	'17': { 
		'error':'Charger temperature too high'
	},
	'18': { 
		'error':'Charger overcurrent'
	},
	'19': { 
		'error':'Charger current reversed'
	},
	'20': { 
		'error':'Bulk time limit exceeded'
	},
	'21': { 
		'error':'Current sensor issue (sensor bias / sensor broken)'
	},
	'26': { 
		'error':'Terminals overheated'
	},
	'28': { 
		'error':'Converter issue (dual converter models only)'
	},
	'33': { 
		'error':'Input voltage too high (solar panel)'
	},
	'34': { 
		'error':'Input current too high (solar panel)'
	},
	'38': { 
		'error':'Input shutdown (due to excessive battery voltage)'
	},
	'39': { 
		'error':'Input shutdown (due to current flow during off mode'
	},
	'65': { 
		'error':'Lost communication with one of devices'
	},
	'66': { 
		'error':'Syncronised charging device configuration issue'
	},
	'67': { 
		'error':'BMS connection lost'
	},
	'68': { 
		'error':'Network misconfigured'
	},
	'116': { 
		'error':'Factory calibration data lost'
	},
	'117': { 
		'error':'Invalid or incompatible firmware'
	},
	'119': { 
		'error':'User settings invalid'
	}
};
module.exports = ErrorNames;
