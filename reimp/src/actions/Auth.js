import { impfetch } from './lib.js'
import cookie from 'react-cookie';
import { SubmissionError } from 'redux-form'

export const SET_AUTH_TOKEN = "SET_AUTH_TOKEN"
export const CLEAR_AUTH_TOKEN = "CLEAR_AUTH_TOKEN"

function setAuthToken(username, token, user_id) {
    return {
        type: SET_AUTH_TOKEN,
        username: username,
        token: token,
        user_id: user_id
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

export function login(dispatch, settings, username, password) {

    const API_BASE_URL = settings.configured && settings.API_BASE_URL
    const data = { 'username': username,
                   'password': password }

    const params = {method: "POST",
	            credentials: 'same-origin',
	            data: data,
	            headers: {"Content-type": "application/json; charset=UTF-8"}, 
	            body: JSON.stringify(data)}
    
    return impfetch(API_BASE_URL+'imp/login/', dispatch, params)
        .then(response => response.json())
        .then(json => {
            if ( json.token ) {
                dispatch(setAuthToken(username, json.token, json.user_id))
            } else {
                throw new SubmissionError({ _error: 'Invalid credentials' })
            }
        })
    
}

export function change_password(dispatch, settings, password) {

    const API_BASE_URL = settings.configured && settings.API_BASE_URL
    const data = { 'password': password }
    const params = {method: "POST",
	            credentials: 'same-origin',
	            data: data,
	            headers: {"Content-type": "application/json; charset=UTF-8"}, 
	            body: JSON.stringify(data)}
    
    return impfetch(API_BASE_URL+'imp/auth/change_password/', dispatch, params)
}

export function logged_in_user() {
    return { username: cookie.load('username'),
             token: cookie.load('token'),
             user_id: cookie.load('user_id'),
    }
}

export function is_authenticated() {
    const user = logged_in_user()
    return user.user_id !== undefined && user.user_id !== null && user.user_id.length > 0 &&
           user.token !== null && user.token != undefined && user.token.length > 0
}
