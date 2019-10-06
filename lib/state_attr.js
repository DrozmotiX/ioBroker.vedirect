// Classification of all state attributes possible
const state_attrb = {
    "H20" : {
        name: 'Yield today',
        type: 'number',
        role: 'state',
        unit:  'KWh'
    },
    "H21" : {
        name: 'Maximum power today',
        type: 'number',
        role: 'state',
        unit:  'W'
    },    
    "H22" : {
        name: 'Yield yesterday',
        type: 'number',
        role: 'state',
        unit:  'kWh'
    },
    "H23" : {
        name: 'Maximum power yesterday',
        type: 'number',
        role: 'state',
        unit:  'W'
    },
    "PPV" : {
        name: 'Panel voltage',
        type: 'number',
        role: 'state',
        unit:  'V'
    },
    "V" : {
        name: 'Main or channel 1 (battery) voltage',
        type: 'number',
        role: 'state',
        unit:  'V'
    },      
}


module.exports = state_attrb;