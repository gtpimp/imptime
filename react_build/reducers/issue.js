import map from 'lodash/map'
import assign from 'lodash/assign'
import difference from 'lodash/difference'
import union from 'lodash/union'
import keys from 'lodash/keys'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_ISSUES_LOAD_FAILED,
    ANNOUNCE_ISSUES_LOADED,
    ANNOUNCE_LOADING_ISSUES,
    INVALIDATE_ISSUES,
    INVALIDATE_ALL_ISSUES,
} from '../actions/Issues.js'
import {
    ANNOUNCE_CAPTURING_NEW_ISSUE,
    UPDATE_NEW_ISSUE_DETAILS,
    CANCEL_CREATING_NEW_ISSUE,
    ANNOUNCE_SAVING_NEW_ISSUE,
    ANNOUNCE_SAVED_NEW_ISSUE,
    ANNOUNCE_SAVING_NEW_ISSUE_FAILED,
    ANNOUNCE_DELETING_ISSUE,
    ANNOUNCE_ISSUE_DELETED,
    ANNOUNCE_ISSUE_SAVED,
    ANNOUNCE_ISSUE_SAVING,
    ANNOUNCE_DELETE_ISSUE_FAILED
} from '../actions/Issue.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: [],
    invalidated_item_ids: []
}

export default function issue(state = initialState, action) {

    let new_items_by_id = null
    
    switch (action.type) {

	case INVALIDATE_ALL_ISSUES:
	    return Object.assign({}, state,
				 {invalidated_item_ids:keys(state.items_by_id || {})
				 })
	    
        case INVALIDATE_ISSUES:
	    return Object.assign(
		{}, state,
		{invalidated_item_ids: union(state.invalidated_item_ids,
					     action.issue_ids_to_invalidate)
		})

        case ANNOUNCE_LOADING_ISSUES:
            return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.issue_ids_to_load),
		invalidated_item_ids: difference(state.invalidated_item_ids || [],
						 action.issue_ids_to_load)
	    })
	    
        case ANNOUNCE_ISSUES_LOADED:
            return Object.assign({}, state, {
		loading_item_ids: difference(state.loading_item_ids || [],
					     keys(action.items_by_id)),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
        case ANNOUNCE_ISSUES_LOAD_FAILED:
            return state;

	case ANNOUNCE_ISSUE_SAVING:
            return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, [action.issue_id])
	    })
	case ANNOUNCE_ISSUE_SAVED:
	    return Object.assign({}, state,
				 {saving_item_ids: difference(state.saving_item_ids || [],
							      [action.issue_id])
				 })
	case ANNOUNCE_CAPTURING_NEW_ISSUE:
            return Object.assign({}, state,
				 { candidate_issue: {
				     issue_id_before: action.issue_id_before,
				     sprint_id: action.sprint_id}
				 })
	case UPDATE_NEW_ISSUE_DETAILS:
	    return Object.assign(
		{}, state,
		{candidate_issue: Object.assign({},
						state.candidate_issue || {},
						action.candidate_issue)
		})
	case CANCEL_CREATING_NEW_ISSUE:
	    return Object.assign(
		{}, state,
		{candidate_issue: null})
	    
	case ANNOUNCE_SAVING_NEW_ISSUE:
	    return Object.assign(
		{}, state,
		{candidate_issue: Object.assign({},
						state.candidate_issue || {},
						{saving: true})})
	case ANNOUNCE_SAVED_NEW_ISSUE:
	    new_items_by_id = Object.assign({}, state.items_by_id)
	    new_items_by_id[action.issue.id] = action.issue
	    return Object.assign({},
				 state,
				 {candidate_issue: null},
				 {items_by_id: new_items_by_id})
	    
	case ANNOUNCE_SAVING_NEW_ISSUE_FAILED:
	    return Object.assign(
		{}, state,
		{candidate_issue: Object.assign({},
						state.candidate_issue || {},
						{is_saving: false})})

	case ANNOUNCE_DELETING_ISSUE:
            return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, [action.deleting_issue_id])
	    })
	case ANNOUNCE_ISSUE_DELETED:
	    new_items_by_id = Object.assign({}, state.items_by_id)
	    if ( new_items_by_id[action.deleted_issue_id] ) {
		delete new_items_by_id[action.deleted_issue_id]
	    }
	    return Object.assign({}, state,
				 {saving_item_ids: difference(state.saving_item_ids || [],
							      [action.deleted_issue_id]),
				  items_by_id: new_items_by_id})
	case ANNOUNCE_DELETE_ISSUE_FAILED:
            return Object.assign({}, state, {
		saving_item_ids: difference(state.saving_item_ids, [action.deleting_issue_id])
	    })

        default:
            return state
    }
}
