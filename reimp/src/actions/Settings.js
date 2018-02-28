import { MIEN_LIST } from './ItemListKeyRegistry'
import { get } from 'lodash'
import { updateHeaderList } from './Page'
import cookie from 'react-cookie';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'

export function updateSettings(new_settings) {
    return {
        type: UPDATE_SETTINGS,
        new_settings: new_settings
    }
}

export function isConfigured(state) {
    return state.settings
}

export function getSetting(state, name) {
    return (state.settings || {})[name]
}

export function getMien(state, page_key) {
    if ( cookie.load("current_mien") ) {
        return cookie.load("current_mien")
    } else {
        return get(state.settings, "mien", null)
    }
}

export function setMien(mien) {

    cookie.save("current_mien", mien, {path: "/"})
    return {
        type: SET_MIEN,
        mien: mien
    }
}

export function updateMien(mien, page_key) {

    const new_header_list = MIEN_LIST[mien]

    return updateHeaderList(new_header_list, page_key)
}
