
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'

export function setErrorMessage(error) {
    return {
        type: SET_ERROR_MESSAGE,
        error_message: error
    }
}

export function getErrorMessage(state) {
    return (state.notification_bar || {}).error_message
}

export function clearErrorMessage() {
    return setErrorMessage(null)
}
