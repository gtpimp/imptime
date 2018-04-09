import { get } from 'lodash'
import { impfetch } from './lib.js'
import cookie from 'react-cookie';
import { SubmissionError } from 'redux-form'

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

export function requestingNewUserPassword() {
    return { type: ANNOUNCE_REQUEST_NEW_USER_PASSWORD }
}

export function getChangeUserPasswordError(state) {
    return get(state, ['auth', 'change_password_error_message'])
}

function setAuthToken(username, token, user_id, has_usable_password, is_superuser) {
    return {
        type: SET_AUTH_TOKEN,
        username: username,
        token: token,
        user_id: user_id,
        has_usable_password: has_usable_password,
        is_superuser: is_superuser
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
                                          json.has_usable_password, json.is_superuser))
                    if ( json.has_usable_password === "false" ) {
                        window.open('/password/change')
                    }
                } else {
                    throw new SubmissionError({ _error: 'Failed to login' })
                }
            })
    }
    
}

export function login(username, password) {

    return (dispatch, getState) => {
        const state = getState()
        const data = { 'username': username,
                       'password': password }

        const params = {method: "POST",
                  credentials: 'same-origin',
                  data: data,
                  headers: {"Content-type": "application/json; charset=UTF-8"}, 
                  body: JSON.stringify(data)}
        
        return impfetch(state, 'imp/login/', dispatch, params)
            .then(response => response.json())
            .then(json => {
                if ( json.token ) {
                    dispatch(setAuthToken(username, json.token,
                                          json.user_id, json.has_usable_password,
                                          json.is_superuser))
                } else {
                    throw new SubmissionError({ _error: 'Invalid credentials' })
                }
            })
    }
}

export function forgot_password(username) {

    return (dispatch, getState) => {

        const state = getState()
        const data = { 'username': username }
        const params = {method: "POST",
                  credentials: 'same-origin',
                  data: data,
                  headers: {"Content-type": "application/json; charset=UTF-8"}, 
                  body: JSON.stringify(data)}
        return impfetch(state, 'imp/autologin/forgot_password/', dispatch, params).then(
            () => { window.open('/password/reminded') })
    }
}

export function change_password(values) {

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
                    window.open('/password/changed')
                }
            })
            .catch(function (error) {
                dispatch({type: ANNOUNCE_SAVE_USER_PASSWORD_FAILED, error: error})
            })
    }
}

export function logged_in_user() {
    return { username: cookie.load('username'),
             token: cookie.load('token'),
             user_id: cookie.load('user_id'),
             has_usable_password: cookie.load('has_usable_password'),
             is_superuser: cookie.load('is_superuser')
    }
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
                if ( json.status !== 'success' ) {
                    dispatch({type: ANNOUNCE_CREATE_ACCOUNT_REJECTED,
                              error: json.error})
                    throw new SubmissionError(json.field_errors)
                } else {
                    dispatch({type: ANNOUNCE_ACCOUNT_CREATED})
                    window.open('/account/created')
                }
            })
    }
}
