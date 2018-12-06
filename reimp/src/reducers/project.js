import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_PROJECTS_LOAD_FAILED,
    ANNOUNCE_PROJECTS_LOADED,
    ANNOUNCE_LOADING_PROJECTS,
    ANNOUNCE_PROJECTS_SAVED,
    ANNOUNCE_PROJECT_SAVE_FAILED,
    ANNOUNCE_PROJECTS_SAVING,
    INVALIDATE_PROJECTS,
    INVALIDATE_ALL_PROJECTS,
    ANNOUNCE_CAPTURING_NEW_PROJECT,
    UPDATE_NEW_PROJECT_DETAILS,
    CANCEL_CREATING_NEW_PROJECT,
    ANNOUNCE_SAVING_NEW_PROJECT,
    ANNOUNCE_SAVED_NEW_PROJECT,
    ANNOUNCE_SAVING_NEW_PROJECT_FAILED
} from '../actions/Projects.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: []
}

export default function project(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_id = null

    switch (action.type) {
	case INVALIDATE_ALL_PROJECTS:
	    return Object.assign({}, state, {items_by_id: null})

        case INVALIDATE_PROJECTS:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.project_ids_to_invalidate)})

        case ANNOUNCE_LOADING_PROJECTS:
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.project_ids_to_load)
	    })
        case ANNOUNCE_PROJECTS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
        case ANNOUNCE_PROJECTS_LOAD_FAILED:
            setErrorMessage("Failed to load projects: " + action.error_message)
            return state;

        case ANNOUNCE_PROJECTS_SAVING:
	    return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, action.project_ids_to_save)
	    })
        case ANNOUNCE_PROJECTS_SAVED:
            state_copy = Object.assign({}, state, {
		saving_item_ids: Object.assign({},
					       difference(state.saving_item_ids || [],
							  action.project_ids))
	    })
            return state_copy
        case ANNOUNCE_PROJECT_SAVE_FAILED:
            setErrorMessage("Failed to save projects: " + action.error_message)
            return state;

	case ANNOUNCE_CAPTURING_NEW_PROJECT:
            return Object.assign({}, state,
				 { candidate_project: {
				     project_id_before: action.project_id_before,
				     project_id: action.project_id}
				 })
	case UPDATE_NEW_PROJECT_DETAILS:
	    return Object.assign(
		{}, state,
		{candidate_project: Object.assign({},
						  state.candidate_project || {},
						  action.candidate_project)
		})
	case CANCEL_CREATING_NEW_PROJECT:
	    return Object.assign(
		{}, state,
		{candidate_project: null})

	case ANNOUNCE_SAVING_NEW_PROJECT:
	    return Object.assign(
		{}, state,
		{candidate_project: Object.assign({},
						  state.candidate_project || {},
						  {saving: true})})
	case ANNOUNCE_SAVED_NEW_PROJECT:
	    new_items_by_id = Object.assign({}, state.items_by_id)
	    new_items_by_id[action.project.id] = action.project
	    return Object.assign({},
				 state,
				 {candidate_project: null},
				 {items_by_id: new_items_by_id})

	case ANNOUNCE_SAVING_NEW_PROJECT_FAILED:
	    return Object.assign(
		{}, state,
		{candidate_project: Object.assign({},
						  state.candidate_project || {},
						  {is_saving: false})})

        default:
            return state
    }
}
