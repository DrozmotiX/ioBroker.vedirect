// VE.Direct Protocol Version 3.26 from 27 November 2018
// All available product names
const ProductNames = {
	'0x203': { 
		'pid':'BMV-700'
	},
	'0x204': {
		'pid':'BMV-702'
	},
	'0x205': {
		'pid':'BMV-700H'
	},
	'0x300': {
		'pid':'BlueSolar MPPT 70|15'
	},
	'0xA040': {
		'pid':'BlueSolar MPPT 75|50'
	},
	'0xA041': {
		'pid':'BlueSolar MPPT 150|35'
	},
	'0xA042': {
		'pid':'BlueSolar MPPT 75|15'
	},
	'0xA043': {
		'pid':'BlueSolar MPPT 100|15'
	},
	'0xA044': {
		'pid':'BlueSolar MPPT 100|30'
	},
	'0xA045': {
		'pid':'BlueSolar MPPT 100|50'
	},
	'0xA046': {
		'pid':'BlueSolar MPPT 150|70'
	},
	'0xA047': {
		'pid':'BlueSolar MPPT 150|100'
	},
	'0xA049': {
		'pid':'BlueSolar MPPT 100|50 rev2'
	},
	'0xA04A': {
		'pid':'BlueSolar MPPT 100|30 rev2'
	},
	'0xA04B': {
		'pid':'BlueSolar MPPT 150|35 rev2'
	},
	'0xA04C': {
		'pid':'BlueSolar MPPT 75|10'
	},
	'0xA04D': {
		'pid':'BlueSolar MPPT 150|45'
	},
	'0xA04E': {
		'pid':'BlueSolar MPPT 150|60'
	},
	'0xA04F': {
		'pid':'BlueSolar MPPT 150|85'
	},
	'0xA050': {
		'pid':'SmartSolar MPPT 250|100'
	},
	'0xA051': {
		'pid':'SmartSolar MPPT 150|100'
	},
	'0xA052': {
		'pid':'SmartSolar MPPT 150|85'
	},
	'0xA053': {
		'pid':'SmartSolar MPPT 75|15'
	},
	'0xA054': {
		'pid':'SmartSolar MPPT 75|10'
	},
	'0xA055': {
		'pid':'SmartSolar MPPT 100|15'
	},
	'0xA056': {
		'pid':'SmartSolar MPPT 100|30'
	},
	'0xA057': {
		'pid':'SmartSolar MPPT 100|50'
	},
	'0xA058': {
		'pid':'SmartSolar MPPT 150|35'
	},
	'0xA059': {
		'pid':'SmartSolar MPPT 150|100 rev2'
	},
	'0xA05A': {
		'pid':'SmartSolar MPPT 150|85 rev2'
	},
	'0xA05B': {
		'pid':'SmartSolar MPPT 250|70'
	},
	'0xA05C': {
		'pid':'SmartSolar MPPT 250|85'
	},
	'0xA05D': {
		'pid':'SmartSolar MPPT 250|60'
	},
	'0xA05E': {
		'pid':'SmartSolar MPPT 250|45'
	},
	'0xA05F': {
		'pid':'SmartSolar MPPT 100|20'
	},
	'0xA060': {
		'pid':'SmartSolar MPPT 100|20 48V'
	},
	'0xA061': {
		'pid':'SmartSolar MPPT 150|45'
	},
	'0xA062': {
		'pid':'SmartSolar MPPT 150|60'
	},
	'0xA063': {
		'pid':'SmartSolar MPPT 150|70'
	},
	'0xA064': {
		'pid':'SmartSolar MPPT 250|85 rev2'
	},
	'0xA065': {
		'pid':'SmartSolar MPPT 250|100 rev2'
	},
	'0xA102': {
		'pid':'SmartSolar MPPT VE.Can 150/70'
	},
	'0xA103': {
		'pid':'SmartSolar MPPT VE.Can 150/45'
	},
	'0xA104': {
		'pid':'SmartSolar MPPT VE.Can 150/60'
	},
	'0xA105': {
		'pid':'SmartSolar MPPT VE.Can 150/85'
	},
	'0xA106': {
		'pid':'SmartSolar MPPT VE.Can 150/100'
	},
	'0xA107': {
		'pid':'SmartSolar MPPT VE.Can 250/45'
	},
	'0xA108': {
		'pid':'SmartSolar MPPT VE.Can 250/60'
	},
	'0xA109': {
		'pid':'SmartSolar MPPT VE.Can 250/70'
	},
	'0xA10A': {
		'pid':'SmartSolar MPPT VE.Can 250/85'
	},
	'0xA10B': {
		'pid':'SmartSolar MPPT VE.Can 250/100'
	},
	'0xA201': {
		'pid':'Phoenix Inverter 12V 250VA 230V'
	},
	'0xA202': {
		'pid':'Phoenix Inverter 24V 250VA 230V'
	},
	'0xA204': {
		'pid':'Phoenix Inverter 48V 250VA 230V'
	},
	'0xA211': {
		'pid':'Phoenix Inverter 12V 375VA 230V'
	},
	'0xA212': {
		'pid':'Phoenix Inverter 24V 375VA 230V'
	},
	'0xA214': {
		'pid':'Phoenix Inverter 48V 375VA 230V'
	},
	'0xA221': {
		'pid':'Phoenix Inverter 12V 500VA 230V'
	},
	'0xA222': {
		'pid':'Phoenix Inverter 24V 500VA 230V'
	},
	'0xA224': {
		'pid':'Phoenix Inverter 48V 500VA 230V'
	},
	'0xA231': {
		'pid':'Phoenix Inverter 12V 250VA 230V'
	},
	'0xA232': {
		'pid':'Phoenix Inverter 24V 250VA 230V'
	},
	'0xA234': {
		'pid':'Phoenix Inverter 48V 250VA 230V'
	},
	'0xA239': {
		'pid':'Phoenix Inverter 12V 250VA 120V'
	},
	'0xA23A': {
		'pid':'Phoenix Inverter 24V 250VA 120V'
	},
	'0xA23C': {
		'pid':'Phoenix Inverter 48V 250VA 120V'
	},
	'0xA241': {
		'pid':'Phoenix Inverter 12V 375VA 230V'
	},
	'0xA242': {
		'pid':'Phoenix Inverter 24V 375VA 230V'
	},
	'0xA244': {
		'pid':'Phoenix Inverter 48V 375VA 230V'
	},
	'0xA249': {
		'pid':'Phoenix Inverter 12V 375VA 120V'
	},
	'0xA24A': {
		'pid':'Phoenix Inverter 24V 375VA 120V'
	},
	'0xA24C': {
		'pid':'Phoenix Inverter 48V 375VA 120V'
	},
	'0xA251': {
		'pid':'Phoenix Inverter 12V 500VA 230V'
	},
	'0xA252': {
		'pid':'Phoenix Inverter 24V 500VA 230V'
	},
	'0xA254': {
		'pid':'Phoenix Inverter 48V 500VA 230V'
	},
	'0xA259': {
		'pid':'Phoenix Inverter 12V 500VA 120V'
	},
	'0xA25A': {
		'pid':'Phoenix Inverter 24V 500VA 120V'
	},
	'0xA25C': {
		'pid':'Phoenix Inverter 48V 500VA 120V'
	},
	'0xA261': {
		'pid':'Phoenix Inverter 12V 800VA 230V'
	},
	'0xA262': {
		'pid':'Phoenix Inverter 24V 800VA 230V'
	},
	'0xA264': {
		'pid':'Phoenix Inverter 48V 800VA 230V'
	},
	'0xA269': {
		'pid':'Phoenix Inverter 12V 800VA 120V'
	},
	'0xA26A': {
		'pid':'Phoenix Inverter 24V 800VA 120V'
	},
	'0xA26C': {
		'pid':'Phoenix Inverter 48V 800VA 120V'
	},
	'0xA271': {
		'pid':'Phoenix Inverter 12V 1200VA 230V'
	},
	'0xA272': {
		'pid':'Phoenix Inverter 24V 1200VA 230V'
	},
	'0xA274': {
		'pid':'Phoenix Inverter 48V 1200VA 230V'
	},
	'0xA279': {
		'pid':'Phoenix Inverter 12V 1200VA 120V'
	},
	'0xA27A': {
		'pid':'Phoenix Inverter 24V 1200VA 120V'
	},
	'0xA27C': {
		'pid':'Phoenix Inverter 48V 1200VA 120V'
	},
	'0xA281': {
		'pid':'Phoenix Inverter 12V 1600VA 230V'
	},
	'0xA282': {
		'pid':'Phoenix Inverter 24V 1600VA 230V'
	},
	'0xA284': {
		'pid':'Phoenix Inverter 48V 1600VA 230V'
	},
	'0xA291': {
		'pid':'Phoenix Inverter 12V 2000VA 230V'
	},
	'0xA292': {
		'pid':'Phoenix Inverter 24V 2000VA 230V'
	},
	'0xA294': {
		'pid':'Phoenix Inverter 48V 2000VA 230V'
	},
	'0xA2A1': {
		'pid':'Phoenix Inverter 12V 3000VA 230V'
	},
	'0xA2A2': {
		'pid':'Phoenix Inverter 24V 3000VA 230V'
	},
	'0xA2A4': {
		'pid':'Phoenix Inverter 48V 3000VA 230V'
	},
	'0xA340': {
		'pid':'Phoenix Smart IP43 Charger 12|50 (1+1)'
	},
	'0xA341': {
		'pid':'Phoenix Smart IP43 Charger 12|50 (3)'
	},
	'0xA342': {
		'pid':'Phoenix Smart IP43 Charger 24|25 (1+1)'
	},
	'0xA343': {
		'pid':'Phoenix Smart IP43 Charger 24|25 (3)'
	},
	'0xA344': {
		'pid':'Phoenix Smart IP43 Charger 12|30 (1+1)'
	},
	'0xA345': {
		'pid':'Phoenix Smart IP43 Charger 12|30 (3)'
	},
	'0xA346': {
		'pid':'Phoenix Smart IP43 Charger 24|16 (1+1)'
	},
	'0xA347': {
		'pid':'Phoenix Smart IP43 Charger 24|16 (3)'
	}
};
module.exports = ProductNames;