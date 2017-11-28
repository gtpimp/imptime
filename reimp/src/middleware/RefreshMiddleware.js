import {
    ASYNC_REFRESH_NOTIFICATION
} from '../actions/Async'

import moment from 'moment'
import { invalidateProjects } from '../actions/Projects'
import { invalidateSprints } from '../actions/Sprints'
import { invalidateIssues } from '../actions/Issues'
import { invalidateIssueReviews } from '../actions/IssueReviews'
import { invalidateUsers } from '../actions/Users'
import { invalidatePups } from '../actions/ProjectUserPermissions'
import { invalidateIssueGeneralDetails } from '../actions/IssueGeneralDetails'
import { invalidateVisualSpecDocuments, invalidateAllVisualSpecDocuments } from '../actions/VisualSpecDocuments'
import { invalidateVisualSpecIssueAnnotations } from '../actions/VisualSpecIssueAnnotations'
import { invalidateSprintDeadlines } from '../actions/SprintDeadlines'
import { invalidateSprintReviews } from '../actions/SprintReviews'
import { invalidateProjectDashboards } from '../actions/ProjectDashboards'
import { invalidateNudges } from '../actions/Nudges'
import { addAsyncMessage } from '../actions/Async'
import { invalidateSprintRoadmaps, getSprintRoadmapIdsFromSprintIds } from '../actions/SprintRoadmaps'

import {
    invalidateList
} from '../actions/ItemList'

import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__SPRINT_TEMPLATE_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__NUDGE_LIST,
    LIST_KEY__PROJECT_USER_LIST,
    LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST,
    LIST_KEY__RELEASE_NOTES_LIST,
    LIST_KEY__RELEASE_NOTES_EDITOR_LIST,
} from '../actions/ItemListKeyRegistry'
import { each, keys } from 'lodash'

function triggerInvalidateEntity(d, dispatch) {
    // used for updates of existing objects, invalidates or
    // removes the object from the primary entitylists.
    //
    // Components which refer to these objects should automatically refresh
    // these object on demand using componentWillReceiveProps
    if ( d.entity_name === 'project' ) {
        dispatch(invalidateProjects([d.entity_ref]))

    } else if ( d.entity_name === 'sprint' ) {
        dispatch(invalidateSprints([d.entity_ref]))
        const sprint_roadmap_ids = getSprintRoadmapIdsFromSprintIds([d.entity_ref])
        dispatch(invalidateSprintRoadmaps(sprint_roadmap_ids))
        dispatch(invalidateProjectDashboards([d.params.project_id]))

    } else if ( d.entity_name === 'issue' ) {
        dispatch(invalidateIssues([d.entity_ref]))
        dispatch(invalidateIssueGeneralDetails([d.entity_ref]))

    } else if ( d.entity_name === 'issuetag' || d.entity_name === 'tag' || d.entity_name === 'tagcategory' ) {
        dispatch(invalidateIssues(d.params.issues))
        dispatch(invalidateIssueGeneralDetails(d.params.issues))

    } else if ( d.entity_name === 'projectinvite' ) {
        dispatch(invalidateUsers(d.params.users))
        dispatch(invalidateProjects(d.params.projects))

    } else if ( d.entity_name === 'projectpermissions' ) {
        // dispatch(invalidateUsers(d.params.users))
        // dispatch(invalidateProjects(d.params.projects))
        dispatch(invalidatePups([d.entity_ref]))

    } else if ( d.entity_name === 'visualspecdocument' ) {
        dispatch(invalidateVisualSpecDocuments([d.entity_ref]))

    } else if ( d.entity_name === 'visualspecissueannotation' ) {
        dispatch(invalidateVisualSpecIssueAnnotations([d.entity_ref]))
    } else if ( d.entity_name === 'issuereview' ) {
        dispatch(invalidateIssueReviews([d.entity_ref]))
    } else if ( d.entity_name === 'projectdeadline' ) {
        dispatch(invalidateSprintDeadlines([d.entity_ref]))
    } else if ( d.entity_name === 'projectreview' ) {
        dispatch(invalidateSprintReviews([d.entity_ref]))
    } else if ( d.entity_name === 'nudge' ) {
        dispatch(invalidateNudges([d.entity_ref]))
    }
}

function triggerInvalidateItemLists(d, dispatch, list_keys_to_invalidate) {
    // used for creation of new objects. invalidates the lists that point to
    // these objects.
    //
    // Components which show lists of objects should automatically
    // refresh their lists on demand using componentWillReceiveProps
    if ( d.entity_name === 'project' ) {
        list_keys_to_invalidate[LIST_KEY__PROJECT_LIST] = true

    } else if ( d.entity_name === 'sprint' ) {
        list_keys_to_invalidate[LIST_KEY__SPRINT_LIST] = true
        list_keys_to_invalidate[LIST_KEY__SPRINT_TEMPLATE_LIST] = true

    } else if ( d.entity_name === 'issue' ) {
        list_keys_to_invalidate[LIST_KEY__ISSUE_LIST] = true
        list_keys_to_invalidate[LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST] = true
    } else if ( d.entity_name === 'projectinvite' ) {
        list_keys_to_invalidate[LIST_KEY__PROJECT_USER_LIST] = true

    } else if ( d.entity_name === 'projectpermissions' ) {
        list_keys_to_invalidate[LIST_KEY__PROJECT_USER_LIST] = true
    } else if ( d.entity_name === 'visualspecissue' ) {
        if ( d.action_type === "create" ) {
            dispatch(invalidateAllVisualSpecDocuments())
            list_keys_to_invalidate[LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST] = true
        }
    } else if ( d.entity_name == 'releasenote' ) {
        list_keys_to_invalidate[LIST_KEY__RELEASE_NOTES_LIST] = true
        list_keys_to_invalidate[LIST_KEY__RELEASE_NOTES_EDITOR_LIST] = true
        
    } else if ( d.entity_name == 'projectissueorder' ) {
        list_keys_to_invalidate[LIST_KEY__ISSUE_LIST] = true
        list_keys_to_invalidate[LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST] = true
    } else if ( d.entity_name == 'businessprojectorder' ) {
        list_keys_to_invalidate[LIST_KEY__SPRINT_LIST] = true
    } else if ( d.entity_name === 'nudge' ) {
        list_keys_to_invalidate[LIST_KEY__NUDGE_LIST] = true
    }
}

function refreshMiddleware(_ref) {

    var dispatch = _ref.dispatch;

    return function (next) {
        return function (action) {

            if (action && action.type === ASYNC_REFRESH_NOTIFICATION) {

                const payload = action.payload || [{}]

                let list_keys_to_invalidate = {}

                each(payload, (d) => {

                    if ( d.action_type === "create" ) {
                        triggerInvalidateItemLists(d, dispatch, list_keys_to_invalidate)
                    } else if ( d.action_type === "update" ) {
                        triggerInvalidateEntity(d, dispatch)
                        triggerInvalidateItemLists(d, dispatch, list_keys_to_invalidate)
                    } else if ( d.action_type === "delete" ) {
                        triggerInvalidateEntity(d, dispatch)
                        triggerInvalidateItemLists(d, dispatch, list_keys_to_invalidate)
                    } else {
                        console.log("Unknown action_type for async refresh: " + d.action_type)
                    }
                    
                    //dispatch(addAsyncMessage(moment(), d.action_type + " " + d.entity_name + " " + d.entity_ref))
                })

                each(keys(list_keys_to_invalidate), (key) => dispatch(invalidateList(key)))
                
                return
            }
            return next(action)
        }
    }
}

module.exports = refreshMiddleware
