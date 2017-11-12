
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'

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
