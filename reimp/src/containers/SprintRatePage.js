import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import {browserHistory} from 'react-router'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
import EditableSprintName from '../components/EditableSprintName'
import OtherUser from '../components/OtherUser'
import PropertyStackComponent from '../components/PropertyStackComponent'
import SprintTimeSummary from '../components/SprintTimeSummary'
import EditableUserRate from '../components/EditableUserRate'
import EditableUserVelocity from '../components/EditableUserVelocity'
import EditableUserTimeTrackingMode from '../components/EditableUserTimeTrackingMode'
import EditableSprintCommission from '../components/EditableSprintCommission'
import EditableSprintBudget from '../components/EditableSprintBudget'
import EditableSprintRatios from '../components/EditableSprintRatios'
import { has_permission } from '../actions/Users'
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

    renderSprintRatios() {
        const { can_view_rates, can_view_velocity, can_view_time_tracking_mode, can_view_budget,
                user_ids, sprint, sprint_id, project_id } = this.props
        return (
            <div className="sprint-rates__card">
              <h2 className="header">
                Ratios
              </h2>
              <div className="sprint-rates__ratios-list">
                { can_view_time_tracking_mode &&
                  <div className="sprint-rates__sprint-ratios">
                    <EditableSprintRatios sprint_id={sprint_id} />
                  </div>
                }
                { can_view_rates &&
                  <div className="sprint-rates__sprint-commission">
                    <EditableSprintCommission sprint_id={sprint_id} />
                  </div>
                }
                { can_view_budget &&
                  <div className="sprint-rates__sprint-budget">
                    <EditableSprintBudget sprint_id={sprint_id} />
                  </div>
                }
              </div>
            </div>
        )

    }

    renderUserRates() {
        const { can_view_rates, can_view_velocity, can_view_time_tracking_mode,
                user_ids, sprint, sprint_id, project_id } = this.props

        return (
            <div className="sprint-rates__card">
              <h2 className="header">
                Rates
              </h2>
              <table className="sprint-rates__user-list">
                <thead>
                  <tr>
                    <th>User</th>
                    { can_view_rates && <th>Billable rate</th> }
                    { can_view_velocity && <th>Velocity</th> }
                    { can_view_time_tracking_mode && <th>Time tracking mode</th> }
                  </tr>
                </thead>
                <tbody>
                  
                  {map(user_ids, function(user_id) {
                       return (
                           <tr key={user_id}>
                             <td>
                               <OtherUser user_id={user_id}/>
                             </td>
                             { can_view_rates &&
                               <td>
                                 <EditableUserRate user_id={user_id}
                                                   sprint_id={sprint_id} />
                               </td>
                             }
                             { can_view_velocity &&
                               <td>
                                 <EditableUserVelocity user_id={user_id}
                                                       sprint_id={sprint_id} />
                               </td>
                             }
                             { can_view_time_tracking_mode &&
                               <td>
                                 <EditableUserTimeTrackingMode user_id={user_id}
                                                               sprint_id={sprint_id} />
                               </td>
                             }
                           </tr>
                       )
                   })
                  }
                </tbody>
              </table>
            </div>
        )
        
    }
    
    render() {

        const { can_view_rates, can_view_velocity, can_view_time_tracking_mode,
                user_ids, sprint, sprint_id, project_id } = this.props
        
        return (
            <div>
              <h2>{sprint.name}</h2>
              <div className="sprint-rates">
                {this.renderUserRates()}
                {this.renderSprintRatios()}
              </div>
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
    const can_view_rates = has_permission(state, project_id, 'has_view_ctc_billable_rates')
    const can_view_velocity = has_permission(state, project_id, 'has_view_velocity')
    const can_view_budget = has_permission(state, project_id, 'has_view_budget')
    const can_view_time_tracking_mode = can_view_velocity

    return {
        project_id,
        project,
        user_ids,
        sprint_id,
        sprint,
        can_view_rates,
        can_view_velocity,
        can_view_time_tracking_mode,
        can_view_budget
    }
}

export default connect(mapStateToProps)(SprintRatePage)
