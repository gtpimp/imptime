import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_SPRINTS_LOAD_FAILED,
    ANNOUNCE_SPRINTS_LOADED,
    ANNOUNCE_LOADING_SPRINTS,
    ANNOUNCE_SPRINTS_SAVED,
    ANNOUNCE_SPRINTS_SAVE_FAILED,
    ANNOUNCE_SAVING_SPRINTS,
    INVALIDATE_SPRINTS,
    INVALIDATE_ALL_SPRINTS,

    ANNOUNCE_CAPTURING_NEW_SPRINT,
    UPDATE_NEW_SPRINT_DETAILS,
    CANCEL_CREATING_NEW_SPRINT,
    ANNOUNCE_SAVING_NEW_SPRINT,
    ANNOUNCE_SAVED_NEW_SPRINT,
    ANNOUNCE_SAVING_NEW_SPRINT_FAILED,
    DISPLAY_ALL_MODE
} from '../actions/Sprints.js'

const displayStatus = {
    display_all: false
}

const initialState = {
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: []
}

export default function sprint(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_id = null
    let l

    switch (action.type) {
	      case INVALIDATE_ALL_SPRINTS:
	          return Object.assign({}, state, {items_by_id: null})
        case INVALIDATE_SPRINTS:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.sprint_ids_to_invalidate)})

        case ANNOUNCE_LOADING_SPRINTS:
	          return Object.assign({}, state, {
		            loading_item_ids: union(state.loading_item_ids, action.sprint_ids_to_load)
	          })
        case ANNOUNCE_SPRINTS_LOADED:
            state_copy = Object.assign({}, state, {
		            loading_item_ids: Object.assign({},
						                                    difference(state.loading_item_ids || [],
							                                             keys(action.items_by_id))),
		            items_by_id: Object.assign({},
					                                 assign(state.items_by_id, action.items_by_id))
	          })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
        case ANNOUNCE_SPRINTS_LOAD_FAILED:
            setErrorMessage("Failed to load sprints: " + action.error_message)
            return state;
        case ANNOUNCE_SAVING_SPRINTS:
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
        case ANNOUNCE_SPRINTS_SAVE_FAILED:
            setErrorMessage("Failed to save sprints: " + action.error_message)
            return state;

	      case ANNOUNCE_CAPTURING_NEW_SPRINT:
            return Object.assign({}, state,
				                         { candidate_sprint: {
				                             sprint_id_before: action.sprint_id_before,
				                             project_id: action.project_id}
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

        case DISPLAY_ALL_MODE:
            l = Object.assign({}, displayStatus, state_copy[action.page_key] || {})
	          state_copy[action.page_key] = Object.assign({}, l, {"display_all": action.display_all})
	          return state_copy

        default:
            return state
    }
}
