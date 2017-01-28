import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_USERS_LOAD_FAILED,
    ANNOUNCE_USERS_LOADED,
    ANNOUNCE_LOADING_USERS,
    INVALIDATE_USERS
} from '../actions/Users.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: []
}

export default function user(state = initialState, action) {

    switch (action.type) {
        case INVALIDATE_USERS:

	    let new_user_ids = Object.assign({}, state.items_by_id)
	    action.user_ids_to_invalidate.map(function(id_to_invalidate) {
		if ( new_user_ids[id_to_invalidate] ) {
		    delete new_user_ids[id_to_invalidate]
		}
	    })
	    return Object.assign({}, state, {items_by_id: new_user_ids})

        case ANNOUNCE_LOADING_USERS:
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.user_ids_to_load)
	    })
        case ANNOUNCE_USERS_LOADED:
            return Object.assign({}, state, {

		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
	    
        case ANNOUNCE_USERS_LOAD_FAILED:
            setErrorMessage("Failed to load users: " + action.error_message)
            return state;
        default:
            return state
    }
}
