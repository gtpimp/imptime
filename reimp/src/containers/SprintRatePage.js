import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import {withRouter} from 'react-router-dom'
import { setSprintBreadcrumbsHelper } from '../actions/Breadcrumbs'
import OtherUser from '../components/OtherUser'
import EditableUserRate from '../components/EditableUserRate'
import EditableUserVelocity from '../components/EditableUserVelocity'
import EditableUserTimeTrackingMode from '../components/EditableUserTimeTrackingMode'
import EditableSprintCommission from '../components/EditableSprintCommission'
import EditableSprintBudget from '../components/EditableSprintBudget'
import EditableSprintRatios from '../components/EditableSprintRatios'
import { has_permission } from '../actions/Users'
import {
    PAGE_KEY__SPRINT_RATE_PAGE,
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    setPageFlag,
    getPageFlag,
    clearPageFlag
} from '../actions/Page'
import {ensureProjectsLoaded, getProject, saveInviteUser} from '../actions/Projects'
import {ensureSprintsLoaded,
        getSprint
} from '../actions/Sprints'
import ModalDialog from '../components/ModalDialog'
import InviteProjectUserForm from '../components/form/InviteProjectUserForm'

class SprintRatePage extends Component {

    constructor(props) {
        super(props)
        this.onStartInviteUser = this.onStartInviteUser.bind(this)
        this.onCancelInviteUser = this.onCancelInviteUser.bind(this)
        this.onSaveInviteUser = this.onSaveInviteUser.bind(this)
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
        const { dispatch } = this.props
        dispatch(setSprintBreadcrumbsHelper(project, sprint))
    }

    onCancelInviteUser() {
        const {dispatch} = this.props
        dispatch(clearPageFlag(PAGE_KEY__SPRINT_RATE_PAGE, 'inviting_user'))
    }    
    
    onStartInviteUser() {
        const {dispatch} = this.props
        dispatch(setPageFlag(PAGE_KEY__SPRINT_RATE_PAGE, 'inviting_user'))
    }

    onSaveInviteUser(new_value) {
        const {dispatch, project_id} = this.props
        dispatch(saveInviteUser(project_id, new_value.invited_user_email))
        dispatch(clearPageFlag(PAGE_KEY__SPRINT_RATE_PAGE, 'inviting_user'))
    }

    
    renderInviteUser() {
        const { project_id } = this.props
        const that = this
        return (
            <ModalDialog isOpen={true}
                         onClose={that.onCancelInviteUser}
                         title="Add User to Rates List"
                         variant="large">

              <div>
                <InviteProjectUserForm project_id={project_id} onChange={that.onSaveInviteUser}/>
              </div>
            </ModalDialog>
        )
    }
    
    renderSprintRatios() {
        const { can_view_rates, can_view_time_tracking_mode, can_view_budget,
                sprint_id } = this.props
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
                can_view_commission,
                user_ids, sprint_id } = this.props

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
                    { can_view_commission && <th>Billable rate with commission</th> }
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
                                                   sprint_id={sprint_id}
                                                   show_with_commission={false}/>
                               </td>
                             }
                             { can_view_commission &&
                               <td>
                                 <EditableUserRate user_id={user_id}
                                                   sprint_id={sprint_id}
                                                   show_with_commission={true}/>
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

        const { sprint, can_invite_user, is_inviting_user } = this.props
        
        return (
            <div>
              { is_inviting_user && this.renderInviteUser() }
              
              <h2>{sprint.name}</h2>
              { can_invite_user &&
                <div className="sprint-rates__button button button-primary button__default-width" onClick={this.onStartInviteUser}>
                  <i className="material-icons md-18">add_circle_outline</i>
                  Add user
                </div>
              }
              <div className="sprint-rates">
                {this.renderUserRates()}
                {this.renderSprintRatios()}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.match.params.projectId
    const sprint_id = props.match.params.sprintId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const user_ids = project.allowed_user_ids
    const is_inviting_user = getPageFlag(state, PAGE_KEY__SPRINT_RATE_PAGE, 'inviting_user')
    const can_view_rates = has_permission(state, project_id, 'has_view_ctc_billable_rates')
    const can_view_velocity = has_permission(state, project_id, 'has_view_velocity')
    const can_view_budget = has_permission(state, project_id, 'has_view_budget')
    const can_view_commission = can_view_budget && can_view_rates
    const can_view_time_tracking_mode = can_view_velocity
    const can_invite_user = has_permission(state, project_id, 'has_invite_users')
    
    return {
        project_id,
        project,
        user_ids,
        sprint_id,
        sprint,
        can_view_rates,
        can_view_velocity,
        can_view_time_tracking_mode,
        can_view_budget,
        can_view_commission,
        can_invite_user,
        is_inviting_user
    }
}

export default withRouter(connect(mapStateToProps)(SprintRatePage))
