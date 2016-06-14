
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'

export function setErrorMessage(error_message) {
    return {
        type: SET_ERROR_MESSAGE,
        _error_message
    }
}

export function clearErrorMessage() {
    return setErrorMessage(null)
}
