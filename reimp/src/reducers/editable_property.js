
import {
    SET_MODE
} from '../actions/EditableProperty.js'

const initialState = {}

const editable_property_template = {
    // Don't put any objects in here, only primitives
    mode: 'read'
}

export default function editable_property(state = initialState, action) {

    switch (action.type) {
        case SET_MODE:
            let state_copy = Object.assign({}, state)
            let l = Object.assign({}, editable_property_template, state_copy[action.property_key] || {})
	    state_copy[action.property_key] = Object.assign({}, l, {mode: action.mode})
            return state_copy
        default:
            return state
    }
}

