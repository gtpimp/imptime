import { MIEN_LIST } from './ItemListKeyRegistry'
import { get } from 'lodash'

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'

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

export function setMienButton(active_mien) {
    return {
        type: SET_MIEN_BUTTON,
        active_mien: active_mien
    }
}

export function getMienButton(state) {
    return get(state.settings, "active_mien", null)
}
