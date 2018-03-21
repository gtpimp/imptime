import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
import EditableSprintName from '../components/EditableSprintName.js'
import PropertyStackComponent from '../components/PropertyStackComponent'
import SprintTimeSummary from '../components/SprintTimeSummary'
import EditableUserRate from '../components/EditableUserRate'
import { logged_in_users_permissions } from '../actions/Users'
//import '../sass/sprint-rate.scss'
import {
    PAGE_KEY__SPRINT_RATE_PAGE,
    LIST_KEY__SPRINT_RATES
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_sprints
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded,
        getSprint
} from '../actions/Sprints'
import {
    initList,
    selectItems,
    update_list_filter,
    update_list_pagination,
    invalidateList
} from '../actions/ItemList'

class SprintRatePage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINT_RATE_PAGE, ['sprint-rate']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id, project_id, dispatch } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch, sprint_id, user_ids } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
    }

    render() {

        const { can_view, user_ids, sprint, sprint_id, project_id } = this.props
        
        return (
            <div className="sprint-rates">
              <h2 className="header">
                Rates for {sprint.name}
              </h2>
              { !can_view &&
                <div>
                  No permission to view rates
                </div>
              }

              { can_view &&
                <div>
                  {map(user_ids, function(user_id) {
                       return (
                           <div key={user_id} className="sprint-rate">
                             <EditableUserRate user_id={user_id}
                                               sprint_id={sprint_id} />
                           </div>
                       )
                   })
                  }
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const sprint_id = props.params.sprintId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const user_ids = project.allowed_user_ids
    const can_view = logged_in_users_permissions(state, project_id).has_view_ctc_billable_rates
    const can_edit = logged_in_users_permissions(state, project_id).has_edit_ctc_billable_rates

    return {
        project_id,
        project,
        user_ids,
        sprint_id,
        sprint,
        can_view
    }
}

export default connect(mapStateToProps)(SprintRatePage)
