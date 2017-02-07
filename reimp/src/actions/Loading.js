
export const CLEAR_LOADING = 'CLEAR_LOADING'
export const CLEAR_SAVING = 'CLEAR_SAVING'
export const DUPLICATE_GENERIC_LOADED = 'DUPLICATE_GENERIC_LOADED'

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

export function duplicateLoading() {
    return {
        type: DUPLICATE_GENERIC_LOADED
    }
}
