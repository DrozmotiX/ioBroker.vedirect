// VE.Direct Protocol Version 3.33 from 6 June 2023
// All available Monitor Types
const MonitorTypes = {
	'-9': { 
		'type':'Solar Charger'
	},
	'-8': { 
		'type':'Wind Turbine'
	},
	'-7': { 
		'type':'Shaft Generator'
	},
	'-6': { 
		'type':'Alternator'
	},
	'-5': { 
		'type':'Fuel cell'
	},
	'-4': { 
		'type':'Water generator'
	},
	'-3': { 
		'type':'DC/DC charger'
	},
	'-2': { 
		'type':'AC charger'
	},
	'-1': { 
		'type':'Generic source'
	},
	'0': { 
		'type':'Batery Monitor (BMV)'
	},
	'1': { 
		'type':'Generic load'
	},
	'2': { 
		'type':'Electric Drive'
	},
	'3': { 
		'type':'Fridge'
	},
	'4': { 
		'type':'Water pump'
	},
	'5': { 
		'type':'Bilge pump'
	},
	'6': { 
		'type':'DC System'
	},
	'7': { 
		'type':'Inverter'
	},
	'8': { 
		'type':'Water Heater'
	}
};
module.exports = MonitorTypes;