import { setErrorMessage } from '../actions/Error.js'
import indexOf from 'lodash/indexOf'
import { UPDATE_LIST_SELECTION } from '../actions/ItemList'
import {
    ANNOUNCE_ISSUE_SAVED,
    ANNOUNCE_SAVED_NEW_ISSUE,
    ANNOUNCE_ISSUE_DELETED
} from '../actions/Issue'
import {
    invalidateList,
    update_list_filter,
    update_list_pagination
} from '../actions/ItemList'
import { fetchSprintsIfNeeded } from '../actions/Sprints'
import { fetchIssuesIfNeeded, invalidateIssues } from '../actions/Issues'
import {
    invalidateIssueGeneralDetails,
    fetchIssueGeneralDetailsIfNeeded
} from '../actions/IssueGeneralDetails'
import {
    collapse_list,
    expand_list,
    unselectAllItems
} from '../actions/ItemList'

const sprints_list_key = 'sprints'
const projects_list_key = 'projects'
const issues_list_key = 'issues'
const issue_details_developer_key = 'issue_developer_details'

function DevPageMiddleware(_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;

    return function (next) {
	return function (action) {

	    switch (action.type) {
		case UPDATE_LIST_SELECTION:

		    const selected_ids = action.selected_ids || []
		    const selected_id = (selected_ids.length > 0 && selected_ids[0]) || null
		    if (action.list_key == projects_list_key) {
			// Change selected project
			dispatch(update_list_filter(sprints_list_key, {project_id:selected_id}))
			dispatch(invalidateList(sprints_list_key))
			dispatch(fetchSprintsIfNeeded(sprints_list_key))

			if ( selected_id ) {
			    dispatch(collapse_list(projects_list_key))
			    dispatch(collapse_list(issues_list_key))
			    dispatch(expand_list(sprints_list_key))
			}

			dispatch(unselectAllItems(sprints_list_key))
			dispatch(unselectAllItems(issues_list_key))
			dispatch(update_list_filter(issue_details_developer_key, {issue_id:null}))
			
		    } else if (action.list_key == sprints_list_key) {
			// Change selected sprint
			dispatch(update_list_filter(issues_list_key, {sprint_id:selected_id}))
			dispatch(invalidateList(issues_list_key))
			dispatch(fetchIssuesIfNeeded(issues_list_key))

			if ( selected_id ) {
			    dispatch(expand_list(issues_list_key))
			    dispatch(collapse_list(sprints_list_key))
			}
			
			dispatch(unselectAllItems(issues_list_key))
			dispatch(update_list_pagination(issues_list_key, {current_page:1}))
			dispatch(update_list_filter(issue_details_developer_key, {issue_id:null}))
			
		    } else if (action.list_key == issues_list_key) {
			// Change selected issue
			const issue_id = selected_id
			dispatch(update_list_filter(issue_details_developer_key, {issue_id:issue_id}))
			dispatch(invalidateIssueGeneralDetails([issue_id]))
			dispatch(fetchIssueGeneralDetailsIfNeeded([issue_id]))
		    }
		    break
		case ANNOUNCE_ISSUE_SAVED:
		    // dispatch(invalidateIssues([action.issue_id]))
		    dispatch(invalidateIssueGeneralDetails([action.issue_id]))
		    
		    dispatch(fetchIssuesIfNeeded(issues_list_key))
		    dispatch(fetchIssueGeneralDetailsIfNeeded([action.issue_id]))
		    break
		case ANNOUNCE_SAVED_NEW_ISSUE:
		    // dispatch(invalidateIssues([action.issue.id]))
		    // dispatch(invalidateIssueGeneralDetails([action.issue.id]))
		    dispatch(invalidateList(issues_list_key))
		    dispatch(fetchIssuesIfNeeded(issues_list_key))
		    dispatch(fetchIssueGeneralDetailsIfNeeded([action.issue.id]))
		    break
		case ANNOUNCE_ISSUE_DELETED:
		    dispatch(invalidateList(issues_list_key))
		    dispatch(fetchIssuesIfNeeded(issues_list_key))
		    dispatch(unselectAllItems(issues_list_key))
		    break
	    }
	    return next(action)
	};
    };
}

module.exports = DevPageMiddleware

