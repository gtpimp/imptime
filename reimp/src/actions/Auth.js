import { impfetch } from './lib.js'
import { GLOBAL_SETTINGS } from '../settings'
import cookie from 'react-cookie';

export const SET_AUTH_TOKEN = "SET_AUTH_TOKEN"
export const CLEAR_AUTH_TOKEN = "CLEAR_AUTH_TOKEN"

function setAuthToken(username, token) {
    return {
        type: SET_AUTH_TOKEN,
        username: username,
        token: token
    }
}

function clearAuthentication() {
    return {
        type: CLEAR_AUTH_TOKEN,
        token: null
    }
}

export function login(username, password) {

    return (dispatch, getState) => {
        const state = getState()
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
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
                    dispatch(setAuthToken(username, json.token))
                } else {
                    alert("Login failed: " + json.non_field_errors)
                }
            })
    }
    
}

export function logged_in_user() {
    return { username: cookie.load('username'),
             token: cookie.load('token')
    }
}

export function is_authenticated() {
    return logged_in_user().token || false
}
