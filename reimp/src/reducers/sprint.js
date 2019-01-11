import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'
import { stringifyIds } from '../actions/lib.js'

import {
    ANNOUNCE_SPRINTS_LOAD_FAILED,
    ANNOUNCE_SPRINTS_LOADED,
    ANNOUNCE_LOADING_SPRINTS,
    ANNOUNCE_SPRINTS_SAVED,
    ANNOUNCE_SPRINT_SAVE_FAILED,
    ANNOUNCE_SPRINTS_SAVING,
    INVALIDATE_SPRINTS,
    INVALIDATE_ALL_SPRINTS,

    ANNOUNCE_CAPTURING_NEW_SPRINT,
    UPDATE_NEW_SPRINT_DETAILS,
    CANCEL_CREATING_NEW_SPRINT,
    ANNOUNCE_SAVING_NEW_SPRINT,
    ANNOUNCE_SAVED_NEW_SPRINT,
    ANNOUNCE_SAVING_NEW_SPRINT_FAILED,

    ANNOUNCE_CLONING_SPRINT,
    ANNOUNCE_CLONED_SPRINT,
    SET_LAST_SELECTED_SPRINT
} from '../actions/Sprints.js'

const initialState = {
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: [],
    invalidated_item_ids: []
}

export default function sprint(state = initialState, action) {

    let state_copy
    let new_items_by_id = null
    let ids = null

    switch (action.type) {
        case INVALIDATE_ALL_SPRINTS:
            ids = stringifyIds(keys(state.items_by_id || []))
            return Object.assign({}, state,
                                 {invalidated_item_ids:ids}
            )
        case INVALIDATE_SPRINTS:
            ids = stringifyIds(action.sprint_ids_to_invalidate)
            return Object.assign(
                {}, state,
                {invalidated_item_ids: union(state.invalidated_item_ids, ids)}
            )

        case ANNOUNCE_LOADING_SPRINTS:
            ids = stringifyIds(action.sprint_ids_to_load)
            return Object.assign({}, state, {
                loading_item_ids: union(state.loading_item_ids, ids),
                invalidated_item_ids: difference(state.invalidated_item_ids || [], ids)
            })
        case ANNOUNCE_SPRINTS_LOADED:
            ids = stringifyIds(keys(action.items_by_id))
            state_copy = Object.assign({}, state, {
                loading_item_ids: Object.assign({},
                                                difference(state.loading_item_ids || [],
                                                           ids)),
                items_by_id: Object.assign({},
                                           assign(state.items_by_id, action.items_by_id))
            })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
        case ANNOUNCE_SPRINTS_LOAD_FAILED:
            setErrorMessage("Failed to load sprints: " + action.error_message)
            return state;
        case ANNOUNCE_SPRINTS_SAVING:
            return Object.assign({}, state, {
                saving_item_ids: union(state.saving_item_ids, action.sprint_ids_to_save)
            })
        case ANNOUNCE_SPRINTS_SAVED:
            state_copy = Object.assign({}, state, {
                saving_item_ids: Object.assign({},
                                               difference(state.saving_item_ids || [],
                                                          action.sprint_ids))
            })
            return state_copy
        case ANNOUNCE_SPRINT_SAVE_FAILED:
            setErrorMessage("Failed to save sprints: " + action.error_message)
            return state;

        case ANNOUNCE_CAPTURING_NEW_SPRINT:
            return Object.assign({}, state,
                                 { candidate_sprint: Object.assign({},
                                                                   { sprint_id_before: action.sprint_id_before,
                                                                     project_id: action.project_id,
                                                                     default_sprint_args: action.default_sprint_args || {}},
                                 )
                                 })
        case UPDATE_NEW_SPRINT_DETAILS:
            return Object.assign(
                {}, state,
                {candidate_sprint: Object.assign({},
                                                 state.candidate_sprint || {},
                                                 action.candidate_sprint)
                })
        case CANCEL_CREATING_NEW_SPRINT:
            return Object.assign(
                {}, state,
                {candidate_sprint: null})

        case ANNOUNCE_SAVING_NEW_SPRINT:
            return Object.assign(
                {}, state,
                {candidate_sprint: Object.assign({},
                                                 state.candidate_sprint || {},
                                                 {saving: true})})
        case ANNOUNCE_SAVED_NEW_SPRINT:
            new_items_by_id = Object.assign({}, state.items_by_id)
            new_items_by_id[action.sprint.id] = action.sprint
            return Object.assign({},
                                 state,
                                 {candidate_sprint: null},
                                 {items_by_id: new_items_by_id})

        case ANNOUNCE_SAVING_NEW_SPRINT_FAILED:
            return Object.assign(
                {}, state,
                {candidate_sprint: Object.assign({},
                                                 state.candidate_sprint || {},
                                                 {is_saving: false})})

        case ANNOUNCE_CLONING_SPRINT:
            return Object.assign({}, state,
                                 {cloning_sprint: Object.assign({sprint_id: action.sprint_id})})

        case ANNOUNCE_CLONED_SPRINT:
            return Object.assign({}, state,
                                 {cloning_sprint: Object.assign({},
                                                                state.cloning_sprint,
                                                                {new_sprint_id: action.new_sprint_id})})
        case SET_LAST_SELECTED_SPRINT:
            return Object.assign({}, state,
                                 {last_selected_sprint_id: action.sprint_id })


        default:
            return state
    }
}
