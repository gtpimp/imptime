export const ANNOUNCE_HEADER_HEIGHT = 'ANNOUNCE_HEADER_HEIGHT'

export function updateHeaderHeight(height) {
    return {
        type: ANNOUNCE_HEADER_HEIGHT,
        headerHeight: height
    }
}
