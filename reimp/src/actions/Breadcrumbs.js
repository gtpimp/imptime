
export const SET_BREADCRUMBS = 'SET_BREADCRUMBS'
export const SET_BREADCRUMBS_ACTIVE = 'SET_BREADCRUMBS_ACTIVE'

export function setBreadcrumbs(breadcrumbs) {
    return {
        type: SET_BREADCRUMBS,
        breadcrumbs: breadcrumbs,
        is_active: true
    }
}

export function setBreadcrumbsActive(is_active) {
    return {
        type: SET_BREADCRUMBS_ACTIVE,
        is_active: is_active
    }
}

export function areBreadcrumbsActive(state) {
    return ((state || {}).breadcrumbs || {}).is_active === true
}

export function getBreadcrumbs(state) {
    return ((state || {}).breadcrumbs || {}).breadcrumbs
}
