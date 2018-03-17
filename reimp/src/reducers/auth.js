import {
    SET_AUTH_TOKEN,
    CLEAR_AUTH_TOKEN,
    ANNOUNCE_REQUEST_NEW_USER_PASSWORD,
    ANNOUNCE_SAVED_USER_PASSWORD,
    ANNOUNCE_SAVE_USER_PASSWORD_REJECTED,
    ANNOUNCE_SAVING_USER_PASSWORD
} from '../actions/Auth'
import cookie from 'react-cookie';

const initialState = {
    token: null,
    change_password_error_message: null,
    saving_password: false
}

export default function auth(state = initialState, action) {

    switch (action.type) {
        case SET_AUTH_TOKEN:
            cookie.save('token', action.token, { path: '/' })
            cookie.save('username', action.username, { path: '/' })
            cookie.save('user_id', action.user_id, { path: '/' })
            cookie.save('has_usable_password', action.has_usable_password, { path: '/' })
            cookie.save('is_superuser', action.is_superuser, { path: '/' })
            return Object.assign({}, state,
                                 { username: action.username,
                                   token: action.token,
                                   user_id: action.user_id,
                                   has_usable_password: action.has_usable_password})
        case CLEAR_AUTH_TOKEN:
            cookie.save('token', "", { path: '/' })
            cookie.save('username', "", { path: '/' })
            cookie.save('user_id', "", { path: '/' })
            cookie.save('has_usable_password', "", { path: '/' })
            cookie.save('is_superuser', "", { path: '/' })
            return Object.assign({}, state,
                                 { username: null,
                                   token: null,
                                   user_id: null,
                                   has_usable_password: null,
                                   is_superuser: null})

        case ANNOUNCE_REQUEST_NEW_USER_PASSWORD:
            return Object.assign({}, state, { change_password_error_message: null })
            
        case ANNOUNCE_SAVED_USER_PASSWORD:
            return Object.assign({}, state, { change_password_error_message: null,
                                              saving_password: false})
            
        case ANNOUNCE_SAVE_USER_PASSWORD_REJECTED:
            return Object.assign({}, state, { change_password_error_message: action.error,
                                              saving_password: false})

        case ANNOUNCE_SAVING_USER_PASSWORD:
            return Object.assign({}, state, { change_password_error_message: action.error,
                                              saving_password: true})
            
        default:
            return state
    }
}

