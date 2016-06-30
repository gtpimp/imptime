import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import indexOf from 'lodash/indexOf'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'

export const RIE_START_EDITING = 'RIE_START_EDITING'
export const RIE_STOP_EDITING = 'RIE_STOP_EDITING'
export const RIE_UPDATE_VALUE = 'RIE_UPDATE_VALUE'

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
