import {
    SET_AUTH_TOKEN,
    CLEAR_AUTH_TOKEN
} from '../actions/Auth'
import cookie from 'react-cookie';

const initialState = {
    token: null
}

export default function auth(state = initialState, action) {

    switch (action.type) {
        case SET_AUTH_TOKEN:
            cookie.save('token', action.token, { path: '/' })
            cookie.save('username', action.username, { path: '/' })
            return Object.assign({}, state,
                                 { username: action.username,
                                   token: action.token })
        case CLEAR_AUTH_TOKEN:
            cookie.save('token', null, { path: '/' })
            cookie.save('username', null, { path: '/' })
            return Object.assign({}, state,
                                 { username: null,
                                   token: null })
        default:
            return state
    }
}

