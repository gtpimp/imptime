import moment from 'moment'
import cookie from 'react-cookies'

export function printCurrentPage(name, auto_timestamp=true) {
    return (dispatch, getState) => {
        const url_to_print = window.location.pathname
        if ( auto_timestamp === true ) {
            name += `_${moment().format("DDMMMYYYY_HHmmss")}`
        }
        dispatch(printUrl(url_to_print, name))
    }
}


export function printUrl(url_to_print, name) {
    return (dispatch, getState) => {
        const state = getState()
        const token = cookie.load("token")
        const url = `${state.settings.API_BASE_URL}imp/pdf/${name}?url=${encodeURI(url_to_print)}&token=${token}`
        window.open(url)
    }
}

export function tokenisedApiUrl(state, partial_url) {
    const token = cookie.load("token")
    return `${state.settings.API_BASE_URL}${partial_url}"?token=${token}`
}

export function downloadUrl(url_to_download) {
    return (dispatch, getState) => {
        const state = getState()
        const url = tokenisedApiUrl(state, url_to_download)
        window.open(url)
    }
}



