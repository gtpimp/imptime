import difference from 'lodash/difference'
import union from 'lodash/union'
import { setErrorMessage } from '../actions/Error'

import {
    SET_MODE
} from '../actions/Form.js'

const initialState = {}

const form_template = {
    // Don't put any objects in here, only primitives
    mode: 'read'
}

export default function form(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let l = Object.assign({}, form_template, state_copy[action.form_key] || {})
    
    switch (action.type) {
        case SET_MODE:
	    state_copy[action.form_key] = Object.assign({}, l, {mode: action.mode})
        default:
            return state
    }
}

