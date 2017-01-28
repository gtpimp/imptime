
export const SET_BREADCRUMBS = 'SET_BREADCRUMBS'

export function setBreadcrumbs(breadcrumbs) {
    return {
        type: SET_BREADCRUMBS,
        breadcrumbs: breadcrumbs
    }
}
