import fetch from 'isomorphic-fetch'
import cookie from 'react-cookie'
import isArray from 'lodash/isArray'

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
    if ( args.params ) {
        let param_payload = JSON.stringify(args.params)
        url += "?params=" + param_payload
    }
    return fetch(url, args)
}
