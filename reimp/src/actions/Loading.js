
export const CLEAR_LOADING = 'CLEAR_LOADING'
export const CLEAR_SAVING = 'CLEAR_SAVING'

export function clearLoading() {
    return {
        type: CLEAR_LOADING
    }
}

export function clearSaving() {
    return {
        type: CLEAR_SAVING
    }
}
