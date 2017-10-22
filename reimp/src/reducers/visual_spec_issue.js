import assign from 'lodash/assign'
import difference from 'lodash/difference'
import union from 'lodash/union'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { stringifyIds } from '../actions/lib.js'

import {
    ANNOUNCE_VISUAL_SPEC_ISSUES_LOAD_FAILED,
    ANNOUNCE_VISUAL_SPEC_ISSUES_LOADED,
    ANNOUNCE_LOADING_VISUAL_SPEC_ISSUES,
    INVALIDATE_VISUAL_SPEC_ISSUES,
    INVALIDATE_ALL_VISUAL_SPEC_ISSUES,
    ANNOUNCE_CAPTURING_NEW_VISUAL_SPEC_ISSUE,
    UPDATE_NEW_VISUAL_SPEC_ISSUE_DETAILS,
    CANCEL_CREATING_NEW_VISUAL_SPEC_ISSUE,
    ANNOUNCE_SAVING_NEW_VISUAL_SPEC_ISSUE,
    ANNOUNCE_SAVED_NEW_VISUAL_SPEC_ISSUE,
    ANNOUNCE_SAVING_NEW_VISUAL_SPEC_ISSUE_FAILED,
    ANNOUNCE_DELETING_VISUAL_SPEC_ISSUE,
    ANNOUNCE_VISUAL_SPEC_ISSUE_DELETED,
    ANNOUNCE_VISUAL_SPEC_ISSUES_SAVED,
    ANNOUNCE_VISUAL_SPEC_ISSUES_SAVING,
    ANNOUNCE_DELETE_VISUAL_SPEC_ISSUE_FAILED
} from '../actions/VisualSpecIssues.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: [],
    invalidated_item_ids: []
}

export default function visual_spec_issue(state = initialState, action) {

    let new_items_by_id = null
    let ids = null

    switch (action.type) {

	case INVALIDATE_ALL_VISUAL_SPEC_ISSUES:
            ids = stringifyIds(keys(state.items_by_id || []))
	    return Object.assign({}, state,
				 {invalidated_item_ids:ids}
            )

        case INVALIDATE_VISUAL_SPEC_ISSUES:
            ids = stringifyIds(action.visual_spec_issue_ids_to_invalidate)
	    return Object.assign(
		{}, state,
		{invalidated_item_ids: union(state.invalidated_item_ids, ids)}
            )

        case ANNOUNCE_LOADING_VISUAL_SPEC_ISSUES:

            ids = stringifyIds(action.visual_spec_issue_ids_to_load)

            return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, ids),
		invalidated_item_ids: difference(state.invalidated_item_ids || [], ids)
	    })

        case ANNOUNCE_VISUAL_SPEC_ISSUES_LOADED:
            ids = stringifyIds(keys(action.items_by_id))
            return Object.assign({}, state, {
		loading_item_ids: difference(state.loading_item_ids || [], ids),
		items_by_id: Object.assign({}, assign(state.items_by_id, action.items_by_id))
	    })
        case ANNOUNCE_VISUAL_SPEC_ISSUES_LOAD_FAILED:
            return state;

	case ANNOUNCE_VISUAL_SPEC_ISSUES_SAVING:
	    const visual_spec_issue_ids = action.visual_spec_issue_ids

            const state_clone = Object.assign({}, state, {
		items_by_id: Object.assign(
		    {},
		    state.items_by_id
		    /* {visual_spec_issue_id: Object.assign(state.items_by_id[visual_spec_issue_id],
		       new_visual_spec_issue_props)}*/
                ),
		saving_item_ids: union(state.saving_item_ids, visual_spec_issue_ids)
	    })

	    const new_visual_spec_issue_props = {}
	    new_visual_spec_issue_props[action.field_name] = action.new_value
            map(visual_spec_issue_ids, function(visual_spec_issue_id, index) {
                state_clone.items_by_id[visual_spec_issue_id] = Object.assign({}, state.items_by_id[visual_spec_issue_id],
		                                                              new_visual_spec_issue_props)
            })
            return state_clone

	case ANNOUNCE_VISUAL_SPEC_ISSUES_SAVED:
	    return Object.assign({}, state,
				 {saving_item_ids: difference(state.saving_item_ids || [],
							      action.visual_spec_issue_ids)
				 })
	case ANNOUNCE_CAPTURING_NEW_VISUAL_SPEC_ISSUE:
            return Object.assign({}, state,
				 { visual_spec_issue: {
				     visual_spec_issue_id_before: action.visual_spec_issue_id_before,
				     sprint_id: action.sprint_id}
				 })
	case UPDATE_NEW_VISUAL_SPEC_ISSUE_DETAILS:
	    return Object.assign(
		{}, state,
		{visual_spec_issue: Object.assign({},
						            state.visual_spec_issue || {},
						            action.visual_spec_issue)
		})
	case CANCEL_CREATING_NEW_VISUAL_SPEC_ISSUE:
	    return Object.assign(
		{}, state,
		{visual_spec_issue: null})

	case ANNOUNCE_SAVING_NEW_VISUAL_SPEC_ISSUE:
	    return Object.assign(
		{}, state,
		{visual_spec_issue: Object.assign({},
						            state.visual_spec_issue || {},
						            {saving: true})})
	case ANNOUNCE_SAVED_NEW_VISUAL_SPEC_ISSUE:
	    new_items_by_id = Object.assign({}, state.items_by_id)
	    new_items_by_id[action.visual_spec_issue.id] = action.visual_spec_issue
	    return Object.assign({},
				 state,
				 {visual_spec_issue: null},
				 {items_by_id: new_items_by_id})

	case ANNOUNCE_SAVING_NEW_VISUAL_SPEC_ISSUE_FAILED:
	    return Object.assign(
		{}, state,
		{visual_spec_issue: Object.assign({},
						            state.visual_spec_issue || {},
						            {is_saving: false})})

	case ANNOUNCE_DELETING_VISUAL_SPEC_ISSUE:
            return Object.assign({}, state, {
		saving_item_ids: union(state.saving_item_ids, [action.deleting_visual_spec_issue_id])
	    })
	case ANNOUNCE_VISUAL_SPEC_ISSUE_DELETED:
	    new_items_by_id = Object.assign({}, state.items_by_id)
	    if ( new_items_by_id[action.deleted_visual_spec_issue_id] ) {
		delete new_items_by_id[action.deleted_visual_spec_issue_id]
	    }
	    return Object.assign({}, state,
				 {saving_item_ids: difference(state.saving_item_ids || [],
							      [action.deleted_visual_spec_issue_id]),
				  items_by_id: new_items_by_id})
	case ANNOUNCE_DELETE_VISUAL_SPEC_ISSUE_FAILED:
            return Object.assign({}, state, {
		saving_item_ids: difference(state.saving_item_ids, [action.deleting_visual_spec_issue_id])
	    })

        default:
            return state
    }
}
