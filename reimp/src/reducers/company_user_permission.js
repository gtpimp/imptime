import { keys, union, difference, assign, forEach } from 'lodash'
import { setErrorMessage } from '../actions/Error'
import { stringifyIds } from '../actions/lib.js'

import {
    ANNOUNCE_CUPS_SAVING,
    ANNOUNCE_CUPS_SAVED,
    ANNOUNCE_CUPS_SAVE_FAILED,
    ANNOUNCE_CUPS_LOADED,
    ANNOUNCE_CUPS_LOAD_FAILED,
    ANNOUNCE_LOADING_CUPS,
    INVALIDATE_CUPS,
    INVALIDATE_ALL_CUPS,
} from '../actions/CompanyUserPermissions.js'

const initialState = {
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: [],
    cup_ids_by_company_and_user: {},
    loading_cups_by_company_and_user: {},
    saving_cups_by_company_and_user: {},
    invalidated_item_ids: []
}

export default function company_user_permission(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let ids
    
    switch (action.type) {
	case INVALIDATE_ALL_CUPS:
            ids = stringifyIds(keys(state.items_by_id || []))
	    return Object.assign({}, state,
				 {invalidated_item_ids:ids}
            )
            
        case INVALIDATE_CUPS:
            ids = stringifyIds(action.cup_ids_to_invalidate)
            
            return Object.assign({}, state,
                                 {invalidated_item_ids: union(state.invalidated_item_ids, ids)})
                                 

        case ANNOUNCE_LOADING_CUPS:
            const loading_cups = Object.assign({}, state_copy.loading_cups_by_company_and_user)
            ids = stringifyIds(action.cup_ids_to_load)
            if ( action.company_id ) {
                loading_cups[""+action.company_id] = true
            }
            
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.cup_ids_to_load || []),
                loading_cups_by_company_and_user: loading_cups,
                invalidated_item_ids: difference(state.invalidated_item_ids || [], ids)
	    })
            
        case ANNOUNCE_CUPS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id || []))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })

            if ( action.company_id ) {
                const loading_cups = Object.assign({}, state_copy.loading_cups_by_company_and_user)
                loading_cups[""+action.company_id] = false
                state_copy.loading_cups_by_company_and_user = loading_cups
            }
            
            const extra_cup_ids_by_company_and_user = {}
            forEach(state_copy.items_by_id, (item) => {
                if ( ! extra_cup_ids_by_company_and_user[item.company_id] ) {
                    extra_cup_ids_by_company_and_user[item.company_id] = {}
                }
                extra_cup_ids_by_company_and_user[item.company_id][item.user_id] = item.id
            })
            state_copy.cup_ids_by_company_and_user = Object.assign({},
                                                                   state_copy.cup_ids_by_company_and_user,
                                                                   extra_cup_ids_by_company_and_user)
            return state_copy
            
        case ANNOUNCE_CUPS_LOAD_FAILED:
            setErrorMessage("Failed to load company user permissions: " + action.error_message)
            return state;
            
        case ANNOUNCE_CUPS_SAVING:
            const saving_cups = Object.assign({}, state_copy.saving_cups_by_company_and_user)
            if ( action.company_id && action.user_id ) {
                saving_cups[""+action.company_id] = Object.assign({}, saving_cups[""+action.company_id] || {})
                saving_cups[""+action.company_id][""+action.user_id] = true
            }
            
	    return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, action.cup_ids_to_save || []),
                saving_cups_by_company_and_user: saving_cups
	    })
            
        case ANNOUNCE_CUPS_SAVED:
            state_copy = Object.assign({}, state, {
		saving_item_ids: Object.assign({},
						difference(state.saving_item_ids || [],
							   action.cup_ids))
	    })
            if ( action.company_id && action.user_id ) {
                const saving_cups = Object.assign({}, state_copy.saving_cups_by_company_and_user)
                saving_cups[""+action.company_id] = Object.assign({}, saving_cups[""+action.company_id] || {})
                saving_cups[""+action.company_id][""+action.user_id] = false
                state_copy.saving_cups_by_company_and_user = saving_cups
            }
            return state_copy
            
        case ANNOUNCE_CUPS_SAVE_FAILED:
            setErrorMessage("Failed to save cups: " + action.error_message)
            return state;

        default:
            return state
    }
}
