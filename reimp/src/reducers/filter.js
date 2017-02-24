import {
    INIT_FILTER,
    CLEAR_FILTER,
    ANNOUNCE_FILTER_LOADING,
    ANNOUNCE_FILTER_LOADED,
    ANNOUNCE_FILTER_LOAD_FAILED,
    CHANGE_FILTER_DISPLAY_STATE
} from '../actions/Filter.js'
import { setErrorMessage } from '../actions/Error'


const filter_template = {
    term: null,
    results: null,
    error: null,
    is_loading: false
}

const initial_state = {
}

export default function filter(state=initial_state, action) {

    let state_copy
    let l
    
    switch (action.type) {

        case INIT_FILTER:
            let state_copy = Object.assign({}, state)
            let l = Object.assign({}, filter_template, state_copy[action.filter_key] || {})
	    state_copy[action.filter_key] = Object.assign({}, l, {
                url: action.url,
	    })
	    return state_copy

        case CLEAR_FILTER:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, filter_template, state_copy[action.filter_key] || {})
	    state_copy[action.filter_key] = Object.assign({}, l, {
                results: null,
                is_loading: false,
                error: null
	    })
	    return state_copy

        case CHANGE_FILTER_DISPLAY_STATE:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, filter_template, state_copy[action.filter_key] || {})
	    state_copy[action.filter_key] = Object.assign({}, l, {
                is_visible: action.is_visible
	    })
	    return state_copy
            
	case ANNOUNCE_FILTER_LOADING:
            state_copy = Object.assign({}, state)
            l = Object.assign({}, filter_template, state_copy[action.filter_key] || {})
	    state_copy[action.filter_key] = Object.assign({}, l, {
                is_loading: true,
                term: action.term,
                error: null
	    })
	    return state_copy
            
	case ANNOUNCE_FILTER_LOADED:
            // don't do anything unless the term matches, because otherwise
            // these results are probably not relevant anymore (ie the
            // user has typed more letters into the filter)
            state_copy = Object.assign({}, state)
            l = Object.assign({}, filter_template, state_copy[action.filter_key] || {})
            if ( l.term == action.term ) {
	        state_copy[action.filter_key] = Object.assign({}, l, {
		    is_loading: false,
		    received_at: action.received_at,
		    results: action.results,
                    error: null
	        })
                return state_copy
            } else {
                return state
            }
            
        case ANNOUNCE_FILTER_LOAD_FAILED:
            setErrorMessage("Failed to load filter results: " + action.error_message)
            state_copy = Object.assign({}, state)
            l = Object.assign({}, filter_template, state_copy[action.filter_key] || {})
            if ( l.term == action.term ) {
	        state_copy[action.filter_key] = Object.assign({}, l, {
                    is_loading: false,
                    error: action.error
	        })
                return state_copy;
            } else {
                return state
            }
                
        default:
            return state
    }
}
