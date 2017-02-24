import slice from 'lodash/slice'

import {
    SET_ERROR_MESSAGE
} from '../actions/Error.js'

import {
    ADD_ASYNC_MSG
} from '../actions/Async.js'

const initialState = {
    error_message: null,
    async_messages: []
}

export default function notification_bar(state = initialState, action) {
    let messages
    switch (action.type) {
        case SET_ERROR_MESSAGE:
	    return Object.assign({}, state, {error_message: action.error_message})
        case ADD_ASYNC_MSG:
            messages = Object.assign([], state.async_messages)
            messages = messages.concat([{msg: action.msg, added_at: action.added_at}])
            const MAX_MESSAGES = 5
            if ( messages.length > MAX_MESSAGES ) {
                messages = slice(messages, messages.length-MAX_MESSAGES)
            }
            return Object.assign({}, state, { 'async_messages': messages })
            /* case REMOVE_ASYNC_MSG:
             *     messages = Object.assign([], state.async_messages)
             *     messages = difference(messages, [action.msg])
             *     return Object.assign({}, state, { 'async_messages': messages })*/
        default:
            return state
    }
}
