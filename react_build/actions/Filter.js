import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import indexOf from 'lodash/indexOf'
import map from 'lodash/map'

export const UPDATE_GLOBAL_FILTER = 'UPDATE_GLOBAL_FILTER'

export function updateGlobalFilter(new_filter_value) {
    return {
	type: UPDATE_GLOBAL_FILTER,
	value: new_filter_value
    }
}

export function clearGlobalFilter() {
    return updateGlobalFilter(null)
}
