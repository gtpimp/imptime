import map from 'lodash/map'
import merge from 'lodash/merge'

import {
    SET_ERROR_MESSAGE
} from '../actions/Error.js'

const initialState = {
    error_message: null
}

export default function notification_bar(state = initialState, action) {
    switch (action.type) {
        case SET_ERROR_MESSAGE:
	    return Object.assign({}, state, {error_message: action.error_message})
        default:
            return state
    }
}
