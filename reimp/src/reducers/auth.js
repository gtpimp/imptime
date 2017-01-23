import {
    SET_AUTH_TOKEN
} from '../actions/Auth'

const initialState = {
    token: null
}

export default function issue(state = initialState, action) {

    switch (action.type) {
        case SET_AUTH_TOKEN:
            return Object.assign({}, state,
                                 { username: action.username,
                                   token: action.token })
        default:
            return state
    }
}

