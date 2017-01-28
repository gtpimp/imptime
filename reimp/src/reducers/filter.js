import {
    UPDATE_GLOBAL_FILTER
} from '../actions/Filter.js'

const initial_state = {
    global_filter: null
}

export default function filter(state=initial_state, action) {

    switch (action.type) {
	case UPDATE_GLOBAL_FILTER:
	    return Object.assign({}, state, {global_filter: action.value})
        default:
            return state
    }
}
