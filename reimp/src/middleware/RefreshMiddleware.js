import {
    ASYNC_REFRESH_NOTIFICATION
} from '../actions/Async'

import { invalidateProjects } from '../actions/Projects'
import { invalidateSprints } from '../actions/Sprints'
import { invalidateFeatures } from '../actions/Features'
import { invalidateTestableLines } from '../actions/TestableLines'
import { invalidateDecisionJournals } from '../actions/DecisionJournals'
import { invalidateCompanies } from '../actions/Companies'
import { invalidateIssues } from '../actions/Issues'
import { invalidateTags } from '../actions/Tags'
import { invalidateIssueReviews } from '../actions/IssueReviews'
import { invalidateUsers } from '../actions/Users'
import { invalidatePups } from '../actions/ProjectUserPermissions'
import { invalidateCups } from '../actions/CompanyUserPermissions'
import { invalidateIssueGeneralDetails } from '../actions/IssueGeneralDetails'
import { invalidateVisualSpecDocuments, invalidateAllVisualSpecDocuments } from '../actions/VisualSpecDocuments'
import { invalidateVisualSpecAnnotations } from '../actions/VisualSpecAnnotations'
import { invalidateAnnotatedVisualSpecDocuments } from '../actions/AnnotatedVisualSpecDocuments'
import { invalidateSprintDeadlines } from '../actions/SprintDeadlines'
import { invalidateSprintReviews } from '../actions/SprintReviews'
import { invalidateProjectDashboards } from '../actions/ProjectDashboards'
import { invalidateNudges } from '../actions/Nudges'
import { invalidateSursForSprint } from '../actions/SprintUserRates'
import { invalidateCompanyProblems } from '../actions/CompanyProblems'
import { invalidateSprintRoadmaps, getSprintRoadmapIdsFromSprintIds } from '../actions/SprintRoadmaps'
import { invalidateAutoClocks } from '../actions/AutoClock'
import { invalidateCostSummary } from '../actions/CostSummary'
import { invalidateAllMultipleIssueSummaries } from '../actions/MultipleIssueSummary'
import { invalidateSurForSprintAndUser } from '../actions/SprintUserRates'
import { invalidateWikis } from '../actions/Wikis'
import { invalidateMiens } from '../actions/Mien'
import { invalidateSchedules } from '../actions/Schedules'
import { invalidateCalendarEvents } from '../actions/CalendarEvents'
import { invalidateSprintSnapshots } from '../actions/SprintSnapshots'

import {
    invalidateList
} from '../actions/ItemList'

import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__NUDGE_LIST,
    LIST_KEY__SPRINT_ROADMAP,
    LIST_KEY__COMPANY_PROBLEM_LIST,
    LIST_KEY__COMPANY_LIST,
    LIST_KEY__DECISION_JOURNAL_LIST,
    LIST_KEY__PROJECT_USER_LIST,
    LIST_KEY__COMPANY_USER_LIST,
    LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST,
    LIST_KEY__MY_ISSUE_LIST_DUE_NOW,
    LIST_KEY__MY_ASSIGNED_ISSUE_LIST,
    LIST_KEY__RELEASE_NOTES_LIST,
    LIST_KEY__RELEASE_NOTES_EDITOR_LIST,
    LIST_KEY__FORM_TAG_LIST,
    LIST_KEY__WIKI_LIST,
    LIST_KEY__FEATURE_LIST,
    LIST_KEY__SPRINT_DEADLINE,
    LIST_KEY__AUTO_CLOCK,
    LIST_KEY__RECENT_AUTO_CLOCK,
    LIST_KEY__RECENT_AUTO_CLOCK_BY_ISSUE,
    LIST_KEY__RECENT_AUTO_CLOCK_UNALLOCATED,
    LIST_KEY__MIEN_LIST,
    LIST_KEY__SCHEDULE_LIST,
    LIST_KEY__CALENDAR_EVENT_LIST,
    LIST_KEY__SPRINT_SNAPSHOT_LIST,
    LIST_KEY__CLOCK_HISTORY_LIST,
    SELECTOR__SPRINTS
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
        dispatch(invalidateCostSummary(d.entity_ref))
        dispatch(invalidateSursForSprint(d.entity_ref))

    } else if ( d.entity_name === 'issue' ) {
        dispatch(invalidateIssues([d.entity_ref]))
        dispatch(invalidateIssueGeneralDetails([d.entity_ref]))
        dispatch(invalidateAllMultipleIssueSummaries())
        dispatch(invalidateCostSummary(d.params.sprint_id))
        if ( d.params.feature_ids ) {
            dispatch(invalidateFeatures(d.params.feature_ids))
        }
        if ( d.params.testable_line_ids ) {
            dispatch(invalidateTestableLines(d.params.testable_line_ids))
        }

    } else if ( d.entity_name === 'issuetag' || d.entity_name === 'tag' || d.entity_name === 'tagcategory' ) {
        dispatch(invalidateIssues(d.params.issues))
        dispatch(invalidateIssueGeneralDetails(d.params.issues))
        dispatch(invalidateTags([d.entity_ref]))
    } else if ( d.entity_name === 'projectinvite' ) {
        dispatch(invalidateUsers(d.params.users))
        dispatch(invalidateProjects(d.params.projects))

    } else if ( d.entity_name === 'projectpermissions' ) {
        dispatch(invalidatePups([d.entity_ref]))
        dispatch(invalidateProjects(d.params.projects))
    } else if ( d.entity_name === 'companypermissions' ) {
        dispatch(invalidateCups([d.entity_ref]))
        dispatch(invalidateCompanies([d.params.company]))
    } else if ( d.entity_name === 'visualspecdocument' ) {
        dispatch(invalidateVisualSpecDocuments([d.entity_ref]))

    } else if ( d.entity_name === 'visualspecannotation' ) {
        dispatch(invalidateVisualSpecAnnotations([d.entity_ref]))
        dispatch(invalidateAnnotatedVisualSpecDocuments([d.params.annotated_visual_spec_document_id]))

    } else if ( d.entity_name === 'issuereview' ) {
        dispatch(invalidateIssueReviews([d.entity_ref]))
    } else if ( d.entity_name === 'projectdeadline' ) {
        dispatch(invalidateSprintDeadlines([d.entity_ref]))
        dispatch(invalidateSprints([d.params.sprint_id]))
    } else if ( d.entity_name === 'projectreview' ) {
        dispatch(invalidateSprintReviews([d.entity_ref]))
    } else if ( d.entity_name === 'nudge' ) {
        dispatch(invalidateNudges([d.entity_ref]))
    } else if ( d.entity_name === 'companyproblem' ) {
        dispatch(invalidateCompanyProblems([d.entity_ref]))
    } else if ( d.entity_name === 'entry' ) {
        dispatch(invalidateAutoClocks([d.entity_ref]))
        // dispatch(invalidateCostSummary(d.params.sprint_id))
    } else if ( d.entity_name === 'user' ) {
        dispatch(invalidateUsers([d.entity_ref]))
    } else if ( d.entity_name === 'decisionjournal' ) {
        dispatch(invalidateDecisionJournals([d.entity_ref]))
    } else if ( d.entity_name === 'company' ) {
        dispatch(invalidateCompanies([d.entity_ref]))
    } else if ( d.entity_name === 'rate' ) {
        dispatch(invalidateSurForSprintAndUser(d.params.sprint_id, d.params.user_id))

        // So that the estimate counts within the sprint shows correctly
        dispatch(invalidateSprints([d.params.sprint_id]))
        dispatch(invalidateCostSummary(d.params.sprint_id))
    } else if ( d.entity_name === 'feature' ) {
        dispatch(invalidateFeatures([d.entity_ref]))

        if ( d.params.testable_line_ids ) {
            dispatch(invalidateTestableLines(d.params.testable_line_ids))
        }
        
    } else if ( d.entity_name === 'projectfeatureorder' ) {
        dispatch(invalidateFeatures([d.params.feature_id]))
    } else if ( d.entity_name === 'wikipage' ) {
        dispatch(invalidateWikis([d.entity_ref]))
    } else if ( d.entity_name === 'mien' ) {
        dispatch(invalidateMiens([d.entity_ref]))
    } else if ( d.entity_name === 'schedule' ) {
        dispatch(invalidateSchedules([d.entity_ref]))
    } else if ( d.entity_name === 'scheduleitem' ) {
        dispatch(invalidateCalendarEvents([d.entity_ref]))
    } else if ( d.entity_name === 'sprintsnapshot' ) {
        dispatch(invalidateSprintSnapshots([d.entity_ref]))
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

        // these two lists contain only issues for unarchived projects, so
        // editing the project means invalidating these lists.
        list_keys_to_invalidate[LIST_KEY__MY_ISSUE_LIST_DUE_NOW] = true
        list_keys_to_invalidate[LIST_KEY__MY_ASSIGNED_ISSUE_LIST] = true
        

    } else if ( d.entity_name === 'sprint' ) {
        list_keys_to_invalidate[LIST_KEY__SPRINT_LIST] = true
        list_keys_to_invalidate[SELECTOR__SPRINTS] = true
        list_keys_to_invalidate[LIST_KEY__SPRINT_ROADMAP] = true

        // these two lists contain only issues for open sprints, so
        // editing the sprint means invalidating these lists.
        list_keys_to_invalidate[LIST_KEY__MY_ISSUE_LIST_DUE_NOW] = true
        list_keys_to_invalidate[LIST_KEY__MY_ASSIGNED_ISSUE_LIST] = true
        

    } else if ( d.entity_name === 'issue' ) {
        list_keys_to_invalidate[LIST_KEY__ISSUE_LIST] = true
        list_keys_to_invalidate[LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST] = true
        list_keys_to_invalidate[LIST_KEY__MY_ISSUE_LIST_DUE_NOW] = true
        list_keys_to_invalidate[LIST_KEY__MY_ASSIGNED_ISSUE_LIST] = true

        // So that the issue count within the sprint shows correctly
        dispatch(invalidateSprints([d.params.sprint_id]))
    } else if ( d.entity_name === 'projectinvite' ) {
        list_keys_to_invalidate[LIST_KEY__PROJECT_USER_LIST] = true

    } else if ( d.entity_name === 'projectpermissions' ) {
        list_keys_to_invalidate[LIST_KEY__PROJECT_USER_LIST] = true
    } else if ( d.entity_name === 'companypermissions' ) {
        list_keys_to_invalidate[LIST_KEY__COMPANY_USER_LIST] = true
    } else if ( d.entity_name === 'visualspecissue' ) {
        if ( d.action_type === "create" ) {
            dispatch(invalidateAllVisualSpecDocuments())
            list_keys_to_invalidate[LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST] = true
        }
    } else if ( d.entity_name === 'releasenote' ) {
        list_keys_to_invalidate[LIST_KEY__RELEASE_NOTES_LIST] = true
        list_keys_to_invalidate[LIST_KEY__RELEASE_NOTES_EDITOR_LIST] = true

    } else if ( d.entity_name === 'projectissueorder' ) {
        list_keys_to_invalidate[LIST_KEY__ISSUE_LIST] = true
        list_keys_to_invalidate[LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST] = true
    } else if ( d.entity_name === 'decisionjournal' ) {
        list_keys_to_invalidate[LIST_KEY__DECISION_JOURNAL_LIST] = true
    } else if ( d.entity_name === 'company' ) {
        list_keys_to_invalidate[LIST_KEY__COMPANY_LIST] = true
    } else if ( d.entity_name === 'projectfeatureorder' ) {
        list_keys_to_invalidate[LIST_KEY__FEATURE_LIST] = true
    } else if ( d.entity_name === 'businessprojectorder' ) {
        list_keys_to_invalidate[LIST_KEY__SPRINT_LIST] = true
        list_keys_to_invalidate[SELECTOR__SPRINTS] = true
        list_keys_to_invalidate[LIST_KEY__SPRINT_ROADMAP] = true
    } else if ( d.entity_name === 'nudge' ) {
        list_keys_to_invalidate[LIST_KEY__NUDGE_LIST] = true
    } else if ( d.entity_name === 'companyproblem' ) {
        if ( d.action_type === "create" || d.action_type === "delete" ) {
            list_keys_to_invalidate[LIST_KEY__COMPANY_PROBLEM_LIST] = true
        }
    } else if ( d.entity_name === 'tag' || d.entity_name === 'tagcategory' ) {
        list_keys_to_invalidate[LIST_KEY__FORM_TAG_LIST] = true
    } else if ( d.entity_name === 'feature' ) {
        list_keys_to_invalidate[LIST_KEY__FEATURE_LIST] = true
        list_keys_to_invalidate[LIST_KEY__SPRINT_ROADMAP] = true
    } else if ( d.entity_name === "wikipage" ) {
        list_keys_to_invalidate[LIST_KEY__WIKI_LIST] = true
        /* not sure why I have to do it this way when none of the others work this way, but it is not invalidating the list on create */
        dispatch(invalidateWikis([d.entity_ref]))
    } else if ( d.entity_name === "projectdeadline" ) {
        list_keys_to_invalidate[LIST_KEY__SPRINT_DEADLINE] = true
    } else if ( d.entity_name === "entry" ) {
        list_keys_to_invalidate[LIST_KEY__AUTO_CLOCK] = true
        list_keys_to_invalidate[LIST_KEY__RECENT_AUTO_CLOCK] = true
        list_keys_to_invalidate[LIST_KEY__RECENT_AUTO_CLOCK_BY_ISSUE] = true
        list_keys_to_invalidate[LIST_KEY__CLOCK_HISTORY_LIST] = true
        list_keys_to_invalidate[LIST_KEY__RECENT_AUTO_CLOCK_UNALLOCATED] = true
    } else if ( d.entity_name === "mien" ) {
        list_keys_to_invalidate[LIST_KEY__MIEN_LIST] = true
    } else if ( d.entity_name === "schedule" ) {
        list_keys_to_invalidate[LIST_KEY__SCHEDULE_LIST] = true
    } else if ( d.entity_name === "scheduleitem" ) {
        list_keys_to_invalidate[LIST_KEY__CALENDAR_EVENT_LIST] = true
    } else if ( d.entity_name === 'sprintsnapshot' ) {
        list_keys_to_invalidate[LIST_KEY__SPRINT_SNAPSHOT_LIST] = true
    }
}

export default function refreshMiddleware(_ref) {

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

                })

                each(keys(list_keys_to_invalidate), (key) => dispatch(invalidateList(key)))

                return
            }
            return next(action)
        }
    }
}
