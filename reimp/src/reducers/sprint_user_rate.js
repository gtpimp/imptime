import assign from 'lodash/assign'
import { get, keys, keyBy, filter, union, forEach, difference } from 'lodash'
import { setErrorMessage } from '../actions/Error'
import { stringifyIds } from '../actions/lib.js'

import {
    ANNOUNCE_SURS_SAVING,
    ANNOUNCE_SURS_SAVED,
    ANNOUNCE_SURS_SAVE_FAILED,
    ANNOUNCE_SURS_LOADED,
    ANNOUNCE_SURS_LOAD_FAILED,
    ANNOUNCE_LOADING_SURS,
    INVALIDATE_SURS,
    INVALIDATE_ALL_SURS,
    INVALIDATE_SURS_FOR_SPRINT,
    INVALIDATE_SUR_FOR_SPRINT_AND_USER
} from '../actions/SprintUserRates.js'

const initialState = {
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: [],
    sur_ids_by_sprint_and_user: {},
    loading_surs_by_sprint_and_user: {},
    saving_surs_by_sprint_and_user: {},
    invalidated_item_ids: []
}

export default function sprint_user_rate(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let ids
    let surs
    let surs_ids_to_invalidate
    
    switch (action.type) {
	case INVALIDATE_ALL_SURS:
            ids = stringifyIds(keys(state.items_by_id || []))
	    return Object.assign({}, state,
				 {invalidated_item_ids:ids}
            )
            
        case INVALIDATE_SURS:
            ids = stringifyIds(action.sur_ids_to_invalidate)
            return Object.assign({}, state,
                                 {invalidated_item_ids: union(state.invalidated_item_ids, ids)})

        case INVALIDATE_SURS_FOR_SPRINT:
            surs = get(state, 'items_by_id')
            surs_ids_to_invalidate = stringifyIds(keys(keyBy(filter(surs, (sur) => ""+sur.sprint_id===""+action.sprint_id), "id")))
            return Object.assign({}, state,
                                 {invalidated_item_ids: union(state.invalidated_item_ids, surs_ids_to_invalidate)})

        case INVALIDATE_SUR_FOR_SPRINT_AND_USER:
            surs = get(state, 'items_by_id')
            surs_ids_to_invalidate = stringifyIds(keys(keyBy(filter(surs, (sur) => ""+sur.sprint_id===""+action.sprint_id && ""+sur.user_id===""+action.user_id), "id")))
            return Object.assign({}, state,
                                 {invalidated_item_ids: union(state.invalidated_item_ids, surs_ids_to_invalidate)})
            
        case ANNOUNCE_LOADING_SURS:
            const loading_surs = Object.assign({}, state_copy.loading_surs_by_sprint_and_user)
            ids = stringifyIds(action.sur_ids_to_load)
            if ( action.sprint_id && action.user_id ) {
                loading_surs[""+action.sprint_id] = Object.assign({}, loading_surs[""+action.sprint_id] || {})
                loading_surs[""+action.sprint_id][""+action.user_id] = true
            }
            
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.sur_ids_to_load || []),
                loading_surs_by_sprint_and_user: loading_surs,
                invalidated_item_ids: difference(state.invalidated_item_ids || [], ids)
	    })            
        case ANNOUNCE_SURS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id || []))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })

            if ( action.sprint_id && action.user_id ) {
                const loading_surs = Object.assign({}, state_copy.loading_surs_by_sprint_and_user)
                loading_surs[""+action.sprint_id] = Object.assign({}, loading_surs[""+action.sprint_id] || {})
                loading_surs[""+action.sprint_id][""+action.user_id] = false
                state_copy.loading_surs_by_sprint_and_user = loading_surs
            }
            
            const extra_sur_ids_by_sprint_and_user = {}
            forEach(state_copy.items_by_id, (item) => {
                if ( ! extra_sur_ids_by_sprint_and_user[item.sprint_id] ) {
                    extra_sur_ids_by_sprint_and_user[item.sprint_id] = {}
                }
                extra_sur_ids_by_sprint_and_user[item.sprint_id][item.user_id] = item.id
            })
            state_copy.sur_ids_by_sprint_and_user = Object.assign({},
                                                                   state_copy.sur_ids_by_sprint_and_user,
                                                                   extra_sur_ids_by_sprint_and_user)
            return state_copy
        case ANNOUNCE_SURS_LOAD_FAILED:
            setErrorMessage("Failed to load sprint user rates: " + action.error_message)
            return state;
        case ANNOUNCE_SURS_SAVING:
            const saving_surs = Object.assign({}, state_copy.saving_surs_by_sprint_and_user)
            if ( action.sprint_id && action.user_id ) {
                saving_surs[""+action.sprint_id] = Object.assign({}, saving_surs[""+action.sprint_id] || {})
                saving_surs[""+action.sprint_id][""+action.user_id] = true
            }
            
	    return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, action.sur_ids_to_save || []),
                saving_surs_by_sprint_and_user: saving_surs
	    })
            
        case ANNOUNCE_SURS_SAVED:
            state_copy = Object.assign({}, state, {
		saving_item_ids: Object.assign({},
						difference(state.saving_item_ids || [],
							   action.sur_ids))
	    })
            if ( action.sprint_id && action.user_id ) {
                const saving_surs = Object.assign({}, state_copy.saving_surs_by_sprint_and_user)
                saving_surs[""+action.sprint_id] = Object.assign({}, saving_surs[""+action.sprint_id] || {})
                saving_surs[""+action.sprint_id][""+action.user_id] = false
                state_copy.saving_surs_by_sprint_and_user = saving_surs
            }
            return state_copy
            
        case ANNOUNCE_SURS_SAVE_FAILED:
            setErrorMessage("Failed to save surs: " + action.error_message)
            return state;

        default:
            return state
    }
}
