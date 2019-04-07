import cookie from 'react-cookies';

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

export function forceMobile() {
    cookie.save('force_display_mode', 'mobile', { path: '/' })
}

export function forceDesktop() {
    cookie.save('force_display_mode', 'desktop', { path: '/' })
}

export function isMobile() {
    return cookie.load('force_display_mode') === 'mobile' || window.innerWidth <= 720
}

export function isDesktop() {
    return ! isMobile()
}

