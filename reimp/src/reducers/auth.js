import {
    SET_AUTH_TOKEN,
    CLEAR_AUTH_TOKEN,
    ANNOUNCE_REQUEST_NEW_USER_PASSWORD,
    ANNOUNCE_SAVED_USER_PASSWORD,
    ANNOUNCE_SAVE_USER_PASSWORD_REJECTED,
    ANNOUNCE_SAVING_USER_PASSWORD,
    ANNOUNCE_CREATING_ACCOUNT,
    ANNOUNCE_CREATE_ACCOUNT_REJECTED,
    ANNOUNCE_ACCOUNT_CREATED,
    ANNOUNCE_ACCOUNT_CREATION_FAILED,
    START_PERMISSION_INSPECTOR,
    STOP_PERMISSION_INSPECTOR,
    HIGHLIGHT_PERMISSION_INSPECTOR_OBJECT,

} from '../actions/Auth'
import cookie from 'react-cookie';

const initialState = {
    token: null,
    change_password_error_message: null,
    saving_password: false,
    creating_account: false,
    permission_inspector_active: false,
    permission_inspector_object: { project_id: null, permission_name: null }
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

        case ANNOUNCE_CREATING_ACCOUNT:
            return Object.assign({}, state, { creating_account: true})
            
        case ANNOUNCE_CREATE_ACCOUNT_REJECTED:
            return Object.assign({}, state, { creating_account: false})
            
        case ANNOUNCE_ACCOUNT_CREATED:
            return Object.assign({}, state, { creating_account: false})
            
        case ANNOUNCE_ACCOUNT_CREATION_FAILED:
            return Object.assign({}, state, { creating_account: false})

        case START_PERMISSION_INSPECTOR:
            return Object.assign({}, state, {
                permission_inspector_active: true,
                permission_inspector_object: { project_id: action.initial_project_id,
                                               permission_name: "has_view_permissions" }})

        case STOP_PERMISSION_INSPECTOR:
            return Object.assign({}, state, { permission_inspector_active: false})

        case HIGHLIGHT_PERMISSION_INSPECTOR_OBJECT:
            return Object.assign({}, state, {
                permission_inspector_object: { project_id: action.project_id,
                                               permission_name: action.permission_name}})
            
        default:
            return state
    }
}

