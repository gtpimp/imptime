import { impfetch } from './lib.js'
import cookie from 'react-cookie';
import { SubmissionError } from 'redux-form'
import {browserHistory} from 'react-router'

export const SET_AUTH_TOKEN = "SET_AUTH_TOKEN"
export const CLEAR_AUTH_TOKEN = "CLEAR_AUTH_TOKEN"

function setAuthToken(username, token, user_id, has_usable_password) {
    return {
        type: SET_AUTH_TOKEN,
        username: username,
        token: token,
        user_id: user_id,
        has_usable_password: has_usable_password
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
                    dispatch(setAuthToken(json.username, json.token, json.user_id, json.has_usable_password))
                    if ( json.has_usable_password === "false" ) {
                        browserHistory.push('/password/change')
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
                    dispatch(setAuthToken(username, json.token, json.user_id, json.has_usable_password))
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
            () => { browserHistory.push('/password/reminded') })
    }
}

export function change_password(dispatch, settings, password) {

    return (dispatch, getState) => {
        const state = getState()
        const data = { 'password': password }
        const params = {method: "POST",
	                credentials: 'same-origin',
	                data: data,
	                headers: {"Content-type": "application/json; charset=UTF-8"}, 
	                body: JSON.stringify(data)}
        
        return impfetch(state, 'imp/auth/change_password/', dispatch, params).then(
            () => { browserHistory.goBack() })
    }
}

export function logged_in_user() {
    return { username: cookie.load('username'),
             token: cookie.load('token'),
             user_id: cookie.load('user_id'),
             has_usable_password: cookie.load('has_usable_password')
    }
}

export function is_authenticated() {
    const user = logged_in_user()
    return user.user_id !== undefined && user.user_id !== null && user.user_id.length > 0 &&
           user.token !== null && user.token != undefined && user.token.length > 0
}
