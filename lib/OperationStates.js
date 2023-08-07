// VE.Direct Protocol Version 3.33 from 6 June 2023
// All available Operation States
const OperationStates = {
	'0': { 
		'state':'Off'
	},
	'1': { 
		'state':'Low power / Load search'
	},
	'2': { 
		'state':'Fault'
	},
	'3': { 
		'state':'Bulk'
	},
	'4': { 
		'state':'Absorption'
	},
	'5': { 
		'state':'Float'
	},
	'6': { 
		'state':'Storage'
	},
	'7': { 
		'state':'Equalize (manual)'
	},
	'9': { 
		'state':'Inverting'
	},
	'11': { 
		'state':'Power Supply'
	},
	'245': { 
		'state':'Starting-Up'
	},
	'246': { 
		'state':'Repeated absorption'
	},
	'247': { 
		'state':'Auto equalize / Recondition'
	},
	'248': { 
		'state':'Battery Safe'
	},
	'252': { 
		'state':'External Control'
	}
};
module.exports = OperationStates;