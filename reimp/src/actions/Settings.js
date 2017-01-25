
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'

export function updateSettings(new_settings) {
    return {
        type: UPDATE_SETTINGS,
        new_settings: new_settings
    }
}
