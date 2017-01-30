
export const TOOLBAR_SET_ACTIONS = 'TOOLBAR_SET_ACTIONS'

export function setActions(actions) {
    return {
        type: TOOLBAR_SET_ACTIONS,
        actions: actions
    }
}
