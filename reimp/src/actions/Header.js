import { get } from 'lodash'

export const ANNOUNCE_HEADER_HEIGHT = 'ANNOUNCE_HEADER_HEIGHT'
export const ANNOUNCE_FOOTER_HEIGHT = 'ANNOUNCE_FOOTER_HEIGHT'
export const ANNOUNCE_NAVBAR_HEIGHT = 'ANNOUNCE_NAVBAR_HEIGHT'
export const ANNOUNCE_TOOLBAR_HEIGHT = 'ANNOUNCE_TOOLBAR_HEIGHT'

export function updateHeaderHeight(height) {
    return {
        type: ANNOUNCE_HEADER_HEIGHT,
        headerHeight: height
    }
}

export function updateFooterHeight(height) {
    return {
        type: ANNOUNCE_FOOTER_HEIGHT,
        footerHeight: height
    }
}

export function updateNavbarHeight(height) {
    return {
        type: ANNOUNCE_NAVBAR_HEIGHT,
        navbarHeight: height
    }
}

export function updateToolbarHeight(height) {
    return {
        type: ANNOUNCE_TOOLBAR_HEIGHT,
        toolbarHeight: height
    }
}

export function getHeaderHeight(state) {
    return get(state, ["primary_header", "headerHeight"], 0)
}

export function getFooterHeight(state) {
    return get(state, ["primary_header", "footerHeight"], 0)
}

export function getToolbarHeight(state) {
    return get(state, ["primary_header", "toolbarHeight"], 0)
}
