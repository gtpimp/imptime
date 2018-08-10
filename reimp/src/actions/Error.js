
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
export const SET_SOFT_ERROR_MESSAGE = 'SET_SOFT_ERROR_MESSAGE'
export const SET_NOTIFICATION_MESSAGE = 'SET_NOTIFICATION_MESSAGE'

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

export function setNotificationMessage(message) {
    return {
        type: SET_NOTIFICATION_MESSAGE,
        message
    }
}

export function getNotificationMessage(state) {
    return (state.notification_bar || {}).notification_message
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

export function clearNotificationMessage() {
    return setNotificationMessage(null)
}
