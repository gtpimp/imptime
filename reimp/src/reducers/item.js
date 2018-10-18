import assign from 'lodash/assign'
import difference from 'lodash/difference'
import union from 'lodash/union'
import keys from 'lodash/keys'
import map from 'lodash/map'
import omit from 'lodash/omit'
import { stringifyIds } from '../actions/lib.js'

import {

    ANNOUNCE_ITEMS_LOAD_FAILED,
    ANNOUNCE_ITEMS_LOADED,
    ANNOUNCE_LOADING_ITEMS,
    INVALIDATE_ITEMS,
    INVALIDATE_ALL_ITEMS,
    ANNOUNCE_CAPTURING_NEW_ITEM,
    UPDATE_NEW_ITEM_DETAILS,
    CANCEL_CREATING_NEW_ITEM,
    ANNOUNCE_SAVING_NEW_ITEM,
    ANNOUNCE_SAVED_NEW_ITEM,
    ANNOUNCE_SAVING_NEW_ITEM_FAILED,
    ANNOUNCE_DELETING_ITEMS,
    ANNOUNCE_ITEMS_DELETED,
    ANNOUNCE_ITEMS_SAVED,
    ANNOUNCE_ITEMS_SAVING,
    ANNOUNCE_DELETE_ITEMS_FAILED,
    SET_GLOBAL_ENTITY_FLAG,
    UPDATE_ENTIRE_ITEM_FIELD_NAME,
    SET_TRANSIENT_ITEM_VALUE,
    PERFORM_CUSTOM_MANIPULATION
} from '../actions/Item.js'

const initialState = {
}

function cloneItemState(state, action) {
    return Object.assign({}, state[action.entity_key] || {})
}

function setItemState(state, action, item_state) {
    const s = Object.assign({}, state || {})
    s[action.entity_key] = item_state
    return s
}

function updateMultipleItemValues(state, action) {
    const item_ids = action.item_ids
    const s = cloneItemState(state, action)
    s.items_by_id = Object.assign({}, s.items_by_id)

    let new_item_props = {}
    if ( action.field_name === UPDATE_ENTIRE_ITEM_FIELD_NAME ) {
        new_item_props = Object.assign({}, action.new_value)
    } else {
        new_item_props[action.field_name] = action.new_value
    }
    map(item_ids, function(item_id, index) {
        s.items_by_id[item_id] = Object.assign({}, s.items_by_id[item_id],
                                               new_item_props)
    })
    return s
}

export default function item(state = initialState, action) {

    let new_items_by_id = null
    let ids = null
    let s = null

    switch (action.type) {

        case INVALIDATE_ALL_ITEMS:
            s = cloneItemState(state, action)
            ids = stringifyIds(keys(s.items_by_id || []))
            s.invalidated_item_ids = ids
            return setItemState(state, action, s)

        case INVALIDATE_ITEMS:
            ids = stringifyIds(action.item_ids_to_invalidate)
            s = cloneItemState(state, action)
            s.invalidated_item_ids = union(s.invalidated_item_ids, ids)
            return setItemState(state, action, s)

        case ANNOUNCE_LOADING_ITEMS:
            ids = stringifyIds(action.item_ids_to_load)
            s = cloneItemState(state, action)
            s.loading_item_ids = union(s.loading_item_ids, ids)
            s.invalidated_item_ids = difference(s.invalidated_item_ids || [], ids)
            return setItemState(state, action, s)

        case ANNOUNCE_ITEMS_LOADED:
            ids = stringifyIds(keys(action.items_by_id))
            s = cloneItemState(state, action)
            s.loading_item_ids = difference(s.loading_item_ids || [], ids)
            s.items_by_id = Object.assign({}, assign(s.items_by_id, action.items_by_id))
            return setItemState(state, action, s)

        case ANNOUNCE_ITEMS_LOAD_FAILED:
            return state;

        case SET_TRANSIENT_ITEM_VALUE:
            s = updateMultipleItemValues(state, action)
            s.transient_values_by_id = Object.assign(s.transient_values_by_id || {}, {})
            let new_transient_item_values
            map(action.item_ids, function(item_id) {
                new_transient_item_values = Object.assign(s.transient_values_by_id[item_id] || {},
                                                          {[action.field_name]: action.new_value})
                s.transient_values_by_id[item_id] = new_transient_item_values
            })
            return setItemState(state, action, s)
            
        case ANNOUNCE_ITEMS_SAVING:
            s = updateMultipleItemValues(state, action)
            s.saving_item_ids = union(s.saving_item_ids, action.item_ids)
            return setItemState(state, action, s)

        case ANNOUNCE_ITEMS_SAVED:
            s = cloneItemState(state, action)
            s.saving_item_ids = difference(s.saving_item_ids || [], action.item_ids)
            s.items_by_id = Object.assign(s.items_by_id, action.items_by_id)
            return setItemState(state, action, s)

        case ANNOUNCE_CAPTURING_NEW_ITEM:
            s = cloneItemState(state, action)
            s.candidate_item = Object.assign({}, action.candidate_item)
            return setItemState(state, action, s)

        case UPDATE_NEW_ITEM_DETAILS:
            s = cloneItemState(state, action)
            s.candidate_item = Object.assign({}, s.candidate_item, action.candidate_item)
            return setItemState(state, action, s)

        case CANCEL_CREATING_NEW_ITEM:
            s = cloneItemState(state, action)
            s.candidate_item = null
            return setItemState(state, action, s)

        case ANNOUNCE_SAVING_NEW_ITEM:
            s = cloneItemState(state, action)
            s.candidate_item = Object.assign({},
                                             s.candidate_item || {},
                                             {saving: true})
            return setItemState(state, action, s)

        case ANNOUNCE_SAVED_NEW_ITEM:

            s = cloneItemState(state, action)
            new_items_by_id = Object.assign({}, s.items_by_id)
            new_items_by_id[action.item.id] = action.item
            s.candidate_item = null
            s.items_by_id = new_items_by_id
            return setItemState(state, action, s)

        case ANNOUNCE_SAVING_NEW_ITEM_FAILED:

            s = cloneItemState(state, action)
            s.candidate_item = Object.assign({},
                                             s.candidate_item || {},
                                             {is_saving: false})
            return setItemState(state, action, s)

        case ANNOUNCE_DELETING_ITEMS:
            s = cloneItemState(state, action)
            s.saving_item_ids = union(s.saving_item_ids, action.deleting_item_ids)
            return setItemState(state, action, s)

        case ANNOUNCE_ITEMS_DELETED:
            s = cloneItemState(state, action)
            new_items_by_id = Object.assign({}, s.items_by_id)
            new_items_by_id = omit(new_items_by_id, action.deleted_item_ids)

            s.saving_item_ids = difference(s.saving_item_ids || [],
                                           action.deleted_item_ids)
            s.items_by_id = new_items_by_id
            return setItemState(state, action, s)

        case ANNOUNCE_DELETE_ITEMS_FAILED:
            s = cloneItemState(state, action)
            s.saving_item_ids = difference(s.saving_item_ids, action.deleting_item_ids)
            return setItemState(state, action, s)

        case SET_GLOBAL_ENTITY_FLAG:
            s = cloneItemState(state, action)
            s[action.field_name] = action.new_value
            return setItemState(state, action, s)

        case PERFORM_CUSTOM_MANIPULATION:
            s = cloneItemState(state, action)
            s = action.func(s, action)
            return setItemState(state, action, s)

        default:
            return state
    }
}
