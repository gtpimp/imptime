
import { setDisplayMode, getDisplayMode } from  './ItemList'

export function setSprintWidthMode(list_key, mode) {
    return setDisplayMode(list_key, mode)
}


export function getSprintWidthMode(state, list_key) {
    return getDisplayMode(state, list_key) || "clock"
}

