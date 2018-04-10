import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import forEach from 'lodash/forEach'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'
import { stringifyIds } from '../actions/lib.js'

import {
    ANNOUNCE_PUPS_SAVING,
    ANNOUNCE_PUPS_SAVED,
    ANNOUNCE_PUPS_SAVE_FAILED,
    ANNOUNCE_PUPS_LOADED,
    ANNOUNCE_PUPS_LOAD_FAILED,
    ANNOUNCE_LOADING_PUPS,
    INVALIDATE_PUPS,
    INVALIDATE_ALL_PUPS,
} from '../actions/ProjectUserPermissions.js'

const initialState = {
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: [],
    pup_ids_by_project_and_user: {},
    loading_pups_by_project_and_user: {},
    saving_pups_by_project_and_user: {},
    invalidated_item_ids: []
}

export default function project_user_permission(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let ids
    
    switch (action.type) {
	case INVALIDATE_ALL_PUPS:
            ids = stringifyIds(keys(state.items_by_id || []))
	    return Object.assign({}, state,
				 {invalidated_item_ids:ids}
            )
            
        case INVALIDATE_PUPS:
            ids = stringifyIds(action.pup_ids_to_invalidate)
            
            return Object.assign({}, state,
                                 {invalidated_item_ids: union(state.invalidated_item_ids, ids)})
                                 

        case ANNOUNCE_LOADING_PUPS:
            const loading_pups = Object.assign({}, state_copy.loading_pups_by_project_and_user)
            ids = stringifyIds(action.pup_ids_to_load)
            if ( action.project_id && action.user_id ) {
                loading_pups[""+action.project_id] = Object.assign({}, loading_pups[""+action.project_id] || {})
                loading_pups[""+action.project_id][""+action.user_id] = true
            }
            
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.pup_ids_to_load || []),
                loading_pups_by_project_and_user: loading_pups,
                invalidated_item_ids: difference(state.invalidated_item_ids || [], ids)
	    })            
        case ANNOUNCE_PUPS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id || []))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })

            if ( action.project_id && action.user_id ) {
                const loading_pups = Object.assign({}, state_copy.loading_pups_by_project_and_user)
                loading_pups[""+action.project_id] = Object.assign({}, loading_pups[""+action.project_id] || {})
                loading_pups[""+action.project_id][""+action.user_id] = false
                state_copy.loading_pups_by_project_and_user = loading_pups
            }
            
            const extra_pup_ids_by_project_and_user = {}
            forEach(state_copy.items_by_id, (item) => {
                if ( ! extra_pup_ids_by_project_and_user[item.project_id] ) {
                    extra_pup_ids_by_project_and_user[item.project_id] = {}
                }
                extra_pup_ids_by_project_and_user[item.project_id][item.user_id] = item.id
            })
            state_copy.pup_ids_by_project_and_user = Object.assign({},
                                                                   state_copy.pup_ids_by_project_and_user,
                                                                   extra_pup_ids_by_project_and_user)
            return state_copy
        case ANNOUNCE_PUPS_LOAD_FAILED:
            setErrorMessage("Failed to load project user permissions: " + action.error_message)
            return state;
        case ANNOUNCE_PUPS_SAVING:
            const saving_pups = Object.assign({}, state_copy.saving_pups_by_project_and_user)
            if ( action.project_id && action.user_id ) {
                saving_pups[""+action.project_id] = Object.assign({}, saving_pups[""+action.project_id] || {})
                saving_pups[""+action.project_id][""+action.user_id] = true
            }
            
	    return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, action.pup_ids_to_save || []),
                saving_pups_by_project_and_user: saving_pups
	    })
            
        case ANNOUNCE_PUPS_SAVED:
            state_copy = Object.assign({}, state, {
		saving_item_ids: Object.assign({},
						difference(state.saving_item_ids || [],
							   action.pup_ids))
	    })
            if ( action.project_id && action.user_id ) {
                const saving_pups = Object.assign({}, state_copy.saving_pups_by_project_and_user)
                saving_pups[""+action.project_id] = Object.assign({}, saving_pups[""+action.project_id] || {})
                saving_pups[""+action.project_id][""+action.user_id] = false
                state_copy.saving_pups_by_project_and_user = saving_pups
            }
            return state_copy
            
        case ANNOUNCE_PUPS_SAVE_FAILED:
            setErrorMessage("Failed to save pups: " + action.error_message)
            return state;

        default:
            return state
    }
}
