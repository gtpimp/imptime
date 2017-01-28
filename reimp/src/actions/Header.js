export const EXPAND_USER_DASHBOARD = 'EXPAND_USER_DASHBOARD'
export const COLLAPSE_USER_DASHBOARD = 'COLLAPSE_USER_DASHBOARD'

export function expandUserDashboard() {
    return {
        type: EXPAND_USER_DASHBOARD
    }
}

export function collapseUserDashboard() {
    return {
        type: COLLAPSE_USER_DASHBOARD
    }
}

