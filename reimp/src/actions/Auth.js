import { get } from 'lodash'
import { impfetch } from './lib.js'
import cookie from 'react-cookies';
import { SubmissionError } from 'redux-form'
import { getUser } from './Users'

export const SET_AUTH_TOKEN = "SET_AUTH_TOKEN"
export const CLEAR_AUTH_TOKEN = "CLEAR_AUTH_TOKEN"
export const ANNOUNCE_REQUEST_NEW_USER_PASSWORD = 'ANNOUNCE_REQUEST_NEW_USER_PASSWORD'
export const ANNOUNCE_SAVING_USER_PASSWORD = "ANNOUNCE_SAVING_USER_PASSWORD"
export const ANNOUNCE_SAVED_USER_PASSWORD = "ANNOUNCE_SAVED_USER_PASSWORD"
export const ANNOUNCE_SAVE_USER_PASSWORD_FAILED = "ANNOUNCE_SAVE_USER_PASSWORD_FAILED"
export const ANNOUNCE_SAVE_USER_PASSWORD_REJECTED = "ANNOUNCE_SAVE_USER_PASSWORD_REJECTED"
export const ANNOUNCE_CREATING_ACCOUNT = "ANNOUNCE_CREATING_ACCOUNT"
export const ANNOUNCE_CREATE_ACCOUNT_REJECTED = "ANNOUNCE_CREATE_ACCOUNT_REJECTED"
export const ANNOUNCE_ACCOUNT_CREATED = "ANNOUNCE_ACCOUNT_CREATED"
export const ANNOUNCE_ACCOUNT_CREATION_FAILED = "ANNOUNCE_ACCOUNT_CREATION_FAILED"
export const START_PERMISSION_INSPECTOR = "START_PERMISSION_INSPECTOR"
export const STOP_PERMISSION_INSPECTOR = "STOP_PERMISSION_INSPECTOR"
export const HIGHLIGHT_PERMISSION_INSPECTOR_OBJECT = "HIGHLIGHT_PERMISSION_INSPECTOR_OBJECT"
export const ANNOUNCE_SAVING_USER_PROFILE = "ANNOUNCE_SAVING_USER_PROFILE"
export const ANNOUNCE_SAVE_USER_PROFILE_FAILED = "ANNOUNCE_SAVE_USER_PROFILE_FAILED"
export const ANNOUNCE_SAVED_USER_PROFILE = "ANNOUNCE_SAVED_USER_PROFILE"

export function requestingNewUserPassword() {
    return { type: ANNOUNCE_REQUEST_NEW_USER_PASSWORD }
}

export function getChangeUserPasswordError(state) {
    return get(state, ['auth', 'change_password_error_message'])
}

function setAuthToken(username, token, user_id, has_usable_password, is_superuser, is_onboarded) {
    return {
        type: SET_AUTH_TOKEN,
        username,
        token,
        user_id,
        has_usable_password,
        is_superuser,
        is_onboarded
    }
}

export function clearAuthentication() {
    return {
        type: CLEAR_AUTH_TOKEN
    }
}

export function logout() {
    return clearAuthentication()
}

export function auto_login(auto_login_token) {
    return (dispatch, getState) => {
        const state = getState()
        const data = { 'token': auto_login_token }

        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(data)}
        
        return impfetch(state, 'imp/autologin/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if ( json.token ) {
                    dispatch(setAuthToken(json.username, json.token, json.user_id,
                                          json.has_usable_password, json.is_superuser, json.is_onboarded))
                    if ( json.has_usable_password === "false" ) {
                        window.open('/password/change')
                    }
                } else {
                    throw new SubmissionError({ _error: 'Failed to login' })
                }
            })
    }
    
}

export function login(values) {

    return (dispatch, getState) => {
        const state = getState()

        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: values,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(values)}
        
        return impfetch(state, 'imp/login/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if (json.token) {
                    cookie.save('preferred_login_method', values.login_method, { path: '/' })
                    dispatch(setAuthToken(values.username, json.token,
                                          json.user_id, json.has_usable_password,
                                          json.is_superuser,
                                          json.is_onboarded))
                } else {
                    throw new SubmissionError({ _error: 'Invalid username/password combination.' })
                }
                return values
            })
    }
}

export function sendOtpEmail(values) {

    return (dispatch, getState) => {
        const state = getState()
        const data = { 'username': values.username}

        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(data)}
        
        return impfetch(state, 'imp/otp_email/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if (!json.success) {
                    throw new SubmissionError({ _error: 'Login Failed' })
                } else {
                    return values
                }
            })
    }
}

export function forgot_password(username, on_done) {

    return (dispatch, getState) => {

        const state = getState()
        const data = { 'username': username }
        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(data)}
        return impfetch(state, 'imp/autologin/forgot_password/', dispatch, params)
            .then(on_done && on_done())
    }
}

export function onboarding_complete(on_done) {

    return (dispatch, getState) => {

        const state = getState()
        const data = {}
        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(data)}
        return impfetch(state, 'imp/auth/onboarded/', dispatch, params)
            .then(on_done && on_done())
    }
}

export function update_profile({first_name, last_name, mobile_phone_number, on_done}) {

    return (dispatch, getState) => {
        const state = getState()
        dispatch({type: ANNOUNCE_SAVING_USER_PROFILE})
        const data = {first_name, last_name, mobile_phone_number}
        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"},
                        body: JSON.stringify(data)}
        return impfetch(state, 'imp/auth/update_profile/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if (json.status !== 'success') {
                    dispatch({type: ANNOUNCE_SAVE_USER_PROFILE_FAILED,
                              error: json.error})                    
                } else {
                    dispatch({type: ANNOUNCE_SAVED_USER_PROFILE})
                    on_done && on_done()
                    return json
                }
            })
    }
}

export function change_password(values, on_done) {

    return (dispatch, getState) => {
        const state = getState()
        dispatch({type: ANNOUNCE_SAVING_USER_PASSWORD})
        const data = values
        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(data)}
        
        return impfetch(state, 'imp/auth/change_password/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if ( json.status !== 'success' ) {
                    dispatch({type: ANNOUNCE_SAVE_USER_PASSWORD_REJECTED,
                              error: json.error})
                } else {
                    dispatch({type: ANNOUNCE_SAVED_USER_PASSWORD})
                    cookie.save('has_usable_password', true, { path: '/' })
                    on_done && on_done()
                }
            })
            .catch(function (error) {
                dispatch({type: ANNOUNCE_SAVE_USER_PASSWORD_FAILED, error: error})
            })
    }
}

export function logged_in_user(state) {
    let user = { username: cookie.load('username'),
                 token: cookie.load('token'),
                 user_id: cookie.load('user_id'),
                 has_usable_password: cookie.load('has_usable_password') === "true",
                 is_superuser: cookie.load('is_superuser') // deprecated, still used for the release note creator page
    }
    if ( state ) {
        const loaded_user = getUser(state, user.user_id)
        if ( loaded_user ) {
            user = Object.assign({}, user, loaded_user)
            user.loaded = true
        } else {
            user.loaded = false
        }
    }
    return user
}

export function is_authenticated() {
    const user = logged_in_user()
    return user.user_id !== undefined && user.user_id !== null && user.user_id.length > 0 &&
           user.token !== null && user.token !== undefined && user.token.length > 0
}

function is_superuser() {
    const user = logged_in_user()
    return is_authenticated() && user.is_superuser === "true"
}

export function can_create_release_notes() {
    return is_superuser()
}

export function can_delete_release_notes() {
    return is_superuser()
}

export function can_seen_by_release_notes() {
    return is_superuser()
}

export function create_account(values) {

    return (dispatch, getState) => {
        const state = getState()
        dispatch({type: ANNOUNCE_CREATING_ACCOUNT})
        const data = values
        const params = {method: "POST",
                        credentials: 'same-origin',
                        data: data,
                        headers: {"Content-type": "application/json; charset=UTF-8"}, 
                        body: JSON.stringify(data)}
        
        return impfetch(state, 'imp/autologin/create_account/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if (json.status !== 'success') {
                    dispatch({type: ANNOUNCE_CREATE_ACCOUNT_REJECTED,
                              error: json.error})
                    throw new SubmissionError(json.field_errors)
                } else {
                    dispatch({type: ANNOUNCE_ACCOUNT_CREATED})
                    return json
                }
            })
    }
}

export function startPermissionInspector(initial_project_id) {
    return { type: START_PERMISSION_INSPECTOR,
             initial_project_id: initial_project_id}
}

export function stopPermissionInspector() {
    return { type: STOP_PERMISSION_INSPECTOR }
}

export function isPermissionInspectorActive(state) {
    return get(state, [ "auth", "permission_inspector_active"], false)
}

export function highlightObjectForPermissionInspector(project_id, permission_name) {
    return { type: HIGHLIGHT_PERMISSION_INSPECTOR_OBJECT,
             project_id: project_id,
             permission_name: permission_name }
}

export function getHighlightedObjectForPermissionInspector(state) {
    return get(state, [ "auth", "permission_inspector_object"], null)
}

export function isValidEmail(value) {
    return value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? true : false
}
