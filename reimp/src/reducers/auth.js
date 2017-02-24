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
            cookie.save('user_id', action.user_id, { path: '/' })
            return Object.assign({}, state,
                                 { username: action.username,
                                   token: action.token,
                                   user_id: action.user_id})
        case CLEAR_AUTH_TOKEN:
            cookie.save('token', "", { path: '/' })
            cookie.save('username', "", { path: '/' })
            cookie.save('user_id', "", { path: '/' })
            return Object.assign({}, state,
                                 { username: null,
                                   token: null,
                                   user_id: null })
        default:
            return state
    }
}

