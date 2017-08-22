import fetch from 'isomorphic-fetch'
import cookie from 'react-cookie'
import moment from 'moment'
import map from 'lodash/map'
import { logged_in_user, clearAuthentication } from '../actions/Auth'

export const DUPLICATE_LOADING_ERROR_MESSAGE = 'DUPLICATE_LOADING_ERROR_MESSAGE'
export const DUPLICATE_SAVING_ERROR_MESSAGE = 'DUPLICATE_SAVING_ERROR_MESSAGE'

const throttles = throttles || {}

export function stringifyIds(ids) {
    const x = map(ids, function(id) { return "" + id })
    return x
}

export function populateDefaultRequestHeaders(headers) {
    const csrftoken = cookie.load('csrftoken');
    headers['X-CSRFToken'] = csrftoken

    const auth_token = logged_in_user().token
    if ( auth_token ) {
        headers['Authorization'] = 'Token ' + auth_token
    }
}

export function impfetch(state, url, dispatch, args) {

    url = "" + url

    let absolute_url = url
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        absolute_url = state.settings.API_BASE_URL + url
    }

    args = args || {}
    if ( ! args.headers ) {
        args.headers = {}
        args.headers['Content-type'] = 'application/json; charset=UTF-8'
    }
    populateDefaultRequestHeaders(args.headers)

    if ( ! args.credentials ) {
        args.credentials = 'same-origin'
    }

    if ( args.params ) {
        let param_payload = JSON.stringify(args.params)
        absolute_url += "?params=" + param_payload
    }

    const throttle = throttles[absolute_url] || {}
    const THROTTLE_HIT_PAUSE_SECONDS = 0.5
    const now = moment()

    const last_run_was_x_milliseconds_ago = (throttle.last_run_at && now.diff(throttle.last_run_at, 'milliseconds')) || null
    const is_running = throttle.running && last_run_was_x_milliseconds_ago < THROTTLE_HIT_PAUSE_SECONDS*1000

    const last_failure_was_x_milliseconds_ago = (throttle.last_failure_at && now.diff(throttle.last_failure_at, 'milliseconds')) || null
    const failed_recently = last_failure_was_x_milliseconds_ago && last_failure_was_x_milliseconds_ago < THROTTLE_HIT_PAUSE_SECONDS*1000

    if ( is_running || failed_recently ) {
        return new Promise(function(resolve, reject) {
            // Note we accept because we don't know if this will be an error.
            // The calling component is highly likely to call again if the data
            // is still not present so this has a small chance of site integrity.
            setTimeout(function() {

                if ( args.method === "POST" || args.method === "PUT" || args.method === "DELETE" ) {
                    reject(DUPLICATE_SAVING_ERROR_MESSAGE)
                } else {
                    reject(DUPLICATE_LOADING_ERROR_MESSAGE)
                }
            }, 100) // Mini pause to prevent reject thrashing.
        })
    }

    // we continue to reference the main throttles object to help with multi-threading
    throttles[absolute_url] = throttle
    throttles[absolute_url].running = true
    throttles[absolute_url].last_run_at = moment()
    const res = fetch(absolute_url, args)
    res.then(function(response) {

        if ( ( (""+response.status)[0] === "4" ) || ( (""+response.status)[0] === "5" ) ) {
            throttles[absolute_url].last_failure_at = moment()
            if ( (response.status === 301 || response.status === 401) && dispatch ) {
                dispatch(clearAuthentication())
            }
        } else {
            throttles[absolute_url].last_failure_at = null
        }
        throttles[absolute_url].running = false
    })
    return res
}

export function format_hours(hours) {
    return new Date(hours*60*60*1000).toISOString().substr(11,5)
}
