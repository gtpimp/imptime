export const RIE_RESET = 'RIE_RESET'
export const RIE_START_EDITING = 'RIE_START_EDITING'
export const RIE_STOP_EDITING = 'RIE_STOP_EDITING'
export const RIE_UPDATE_VALUE = 'RIE_UPDATE_VALUE'
export const RIE_SET_INITIAL_VALUE = 'RIE_SET_INITIAL_VALUE'

export function reset(rie_key) {
    return {
        type: RIE_RESET,
        rie_key: rie_key
    }
}

export function startEditing(rie_key) {
    return {
        type: RIE_START_EDITING,
        rie_key: rie_key
    }
}

export function stopEditing(rie_key) {
    return {
        type: RIE_STOP_EDITING,
        rie_key: rie_key
    }
}

export function updateValue(rie_key, new_value) {
    return {
        type: RIE_UPDATE_VALUE,
        rie_key: rie_key,
        new_value: new_value
    }
}

export function setInitialValue(rie_key, initial_value) {
    return {
        type: RIE_SET_INITIAL_VALUE,
        rie_key: rie_key,
        initial_value: initial_value
    }
}
