import { get, reverse, sortBy, slice } from 'lodash'

export const OPTION_REMEMBERER_OPTION_SELECTED = "OPTION_REMEMBERER_OPTION_SELECTED"

export function optionSelected(rememberer_key, option) {
    return { type: OPTION_REMEMBERER_OPTION_SELECTED,
             rememberer_key: rememberer_key,
             option: option }
}

export function getBestOptions(state, key, max_num_options) {
    const options = get(state, ["option_rememberer", key], {})
    const options_sorted = sortBy(options, ['most_recent'])
    reverse(options_sorted)
    return slice(options_sorted, 0, max_num_options || 4)
}
    
