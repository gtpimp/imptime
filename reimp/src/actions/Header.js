export const ANNOUNCE_HEADER_HEIGHT = 'ANNOUNCE_HEADER_HEIGHT'
export const ANNOUNCE_NAVBAR_HEIGHT = 'ANNOUNCE_NAVBAR_HEIGHT'
export const ANNOUNCE_TOOLBAR_HEIGHT = 'ANNOUNCE_TOOLBAR_HEIGHT'

export function updateHeaderHeight(height) {
    return {
        type: ANNOUNCE_HEADER_HEIGHT,
        headerHeight: height
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
