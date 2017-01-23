import map from 'lodash/map'
import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'

import {
    RIE_RESET,
    RIE_START_EDITING,
    RIE_STOP_EDITING,
    RIE_UPDATE_VALUE,
    RIE_SET_INITIAL_VALUE
} from '../actions/Rie.js'

const initial_state = {
}

const rie_state_template = {
    mode: 'readonly'
}

export default function rie(state=initial_state, action) {

    let state_copy = Object.assign({}, state)
    let r = Object.assign({}, rie_state_template, state_copy[action.rie_key] || {})
    
    switch (action.type) {
	case RIE_RESET:
	    state_copy[action.rie_key] = null
	    return state_copy
	case RIE_START_EDITING:
	    state_copy[action.rie_key] = Object.assign({}, r, {
		mode: 'editing'
	    })
	    return state_copy
        case RIE_STOP_EDITING:
	    state_copy[action.rie_key] = Object.assign({}, r, {
		mode: 'readonly'
	    })
	    return state_copy
	case RIE_UPDATE_VALUE:
	    state_copy[action.rie_key] = Object.assign({}, r, {
		value: action.new_value
	    })
	    return state_copy
	case RIE_SET_INITIAL_VALUE:
	    state_copy[action.rie_key] = Object.assign({}, r, {
		initial_value: action.initial_value,
		value: action.initial_value
	    })
	    return state_copy
        default:
            return state
    }
}
