
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
export const SET_SOFT_ERROR_MESSAGE = 'SET_SOFT_ERROR_MESSAGE'

export function setErrorMessage(error) {
    return {
        type: SET_ERROR_MESSAGE,
        error_message: error
    }
}

export function setSoftErrorMessage(error) {
    return {
        type: SET_SOFT_ERROR_MESSAGE,
        error_message: error
    }
}

export function getErrorMessage(state) {
    return (state.notification_bar || {}).error_message
}

export function clearErrorMessage() {
    return setErrorMessage(null)
}

export function getSoftErrorMessage(state) {
    return (state.notification_bar || {}).soft_error_message
}

export function clearSoftErrorMessage() {
    return setSoftErrorMessage(null)
}
