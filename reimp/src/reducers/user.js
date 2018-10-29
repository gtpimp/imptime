import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_USERS_LOAD_FAILED,
    ANNOUNCE_USERS_LOADED,
    ANNOUNCE_LOADING_USERS,
    INVALIDATE_USERS
} from '../actions/Users.js'

import {
    ANNOUNCE_SAVING_INVITE,
    ANNOUNCE_SAVED_INVITE,
    ANNOUNCE_SAVE_INVITE_FAILED
} from '../actions/Projects.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    inviting_user_id: {}
}

export default function user(state = initialState, action) {

    switch (action.type) {
        case INVALIDATE_USERS:

            // let new_user_ids = Object.assign({}, without(state.items_by_id, id_to_invalidate)
            // action.user_ids_to_invalidate.map(function(id_to_invalidate) {
            // if ( new_user_ids[id_to_invalidate] ) {
            //    delete new_user_ids[id_to_invalidate]
            // }
            // })
            // return Object.assign({}, state, {items_by_id: new_user_ids})
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.user_ids_to_invalidate)})

        case ANNOUNCE_LOADING_USERS:
            return Object.assign({}, state, {
                loading_item_ids: union(state.loading_item_ids, action.user_ids_to_load)
            })
        case ANNOUNCE_USERS_LOADED:

            // const empty_user_ids = difference(state.loading_item_ids, keys(action.items_by_id))
            // forEach(empty_user_ids, function(empty_user_id) {
            //     action.items_by_id[empty_user_id] = {id: empty_user_id,
            //                                          username: 'empty'}
            // })
            
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
        case ANNOUNCE_SAVING_INVITE:
            return Object.assign({}, state, {
                inviting_user_email: action.user_email,
                inviting_project_id: action.project_id,
                inviting_company_id: action.company_id
            })
        case ANNOUNCE_SAVED_INVITE:
            return Object.assign({}, state, {
                inviting_user_email: action.user_email,
                inviting_project_id: action.project_id,
                inviting_company_id: action.company_id
            })
        case ANNOUNCE_SAVE_INVITE_FAILED:
            setErrorMessage("Failed to save user invite: " + action.error_message)
            return state;
        default:
            return state
    }

}
