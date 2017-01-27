import fetch from 'isomorphic-fetch'
import cookie from 'react-cookie'
import isArray from 'lodash/isArray'
import moment from 'moment'
import { logged_in_user } from '../actions/Auth'

const throttles = throttles || {}

export function impfetch(url, args) {

    url = "" + url
    args = args || {}
    if ( ! args.headers ) {
        args.headers = {"Content-type": "application/json; charset=UTF-8"}
    }
    if ( ! args.headers['X-CSRFToken'] ) {
        const csrftoken = cookie.load('csrftoken');
        args.headers['X-CSRFToken'] = csrftoken
    }
    if ( ! args.credentials ) {
        args.credentials = 'same-origin'
    }

    const auth_token = logged_in_user().token
    if ( auth_token ) {
        args.headers['Authorization'] = 'Token ' + auth_token
    }
    
    if ( args.params ) {
        let param_payload = JSON.stringify(args.params)
        url += "?params=" + param_payload
    }

    const throttle = throttles[url] || {}
    const THROTTLE_HIT_PAUSE_SECONDS = 5
    const now = moment()
    
    const last_run_was_x_milliseconds_ago = throttle.last_run_at && now.diff(throttle.last_run_at, 'milliseconds') || null
    const is_running = throttle.running && last_run_was_x_milliseconds_ago < THROTTLE_HIT_PAUSE_SECONDS
    
    const last_failure_was_x_milliseconds_ago = throttle.last_failure_at && now.diff(throttle.last_failure_at, 'milliseconds') || null
    const failed_recently = last_failure_was_x_milliseconds_ago && last_failure_was_x_milliseconds_ago < THROTTLE_HIT_PAUSE_SECONDS*1000
    
    if ( is_running || failed_recently ) {
        return new Promise(function(resolve, reject) {
            // note we reject because we don't want to say anything about
            // whether the existing throttle succeeded, and the caller should
            // try again after checking if the data doesn't exist
            setTimeout(function() { reject(); }, THROTTLE_HIT_PAUSE_SECONDS*1000)
        })
    }

    // we continue to reference the main throttles object to help with multi-threading
    throttles[url] = throttle
    throttles[url].running = true
    throttles[url].last_run_at = moment()
    const res = fetch(url, args)
    res.then(function(response) {

        if ( ( (""+response.status)[0] == "4" ) || ( (""+response.status)[0] == "5" ) ) {
            throttles[url].last_failure_at = moment()
        } else {
            throttles[url].last_failure_at = null
        }
        
        throttles[url].running = false
    })    
    return res
}

export function format_hours(hours) {
    return new Date(hours*60*60*1000).toISOString().substr(11,5)
}
