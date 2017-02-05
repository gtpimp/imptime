export const SET_MODE = 'SET_MODE'

export function setMode(property_key, mode) {
    return {
	type: SET_MODE,
        mode: mode,
	property_key: property_key
    }
}

export function setEditing(property_key) {
    return setMode(property_key, 'edit')
}

export function setReadonly(property_key) {
    return setMode(property_key, 'read')
}

function getMode(state, property_key) {
    return (((state ||{}).editable_property || {})[property_key] || {}).mode || null
}

export function isEditing(state, property_key) {
    return getMode(state, property_key) === 'edit'
}

export function isReadonly(state, property_key) {
    return getMode(state, property_key) === 'read'
}

export function isEmpty(state, property_key) {
    return isReadonly(state, property_key)
}
