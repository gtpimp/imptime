import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import { has_permission } from '../actions/Users'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    ensureSprintUserTimeTrackingModeLoaded,
    getSprintUserTimeTrackingMode,
    updateSprintUserTimeTrackingModes
} from '../actions/SprintUserTimeTrackingMode'
import UserTimeTrackingModeForm from './form/UserTimeTrackingModeForm'
import UserTimeTrackingMode from './UserTimeTrackingMode'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import { getUser, ensureUsersLoaded } from '../actions/Users'

class EditableUserTimeTrackingMode extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        const { dispatch, sprint_id, user_id} = this.props
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserTimeTrackingModeLoaded(sprint_id, user_id))
    }
    
    onChange(new_values) {
        const { dispatch, sprint_id, user_id } = this.props
        dispatch(updateSprintUserTimeTrackingModes([sprint_id], [user_id], new_values))
    }
    
    render() {
        const { sprint_id, project_id, user_id, suttm, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_view_velocity'>
              <PermissionInspectorHighlighter project_id={project_id}
                                              permission_name='has_edit_velocity'>
                <EditableProperty property_key={'user_time_tracking_mode_name_'+sprint_id + "_" + user_id}
                                  initial_value={suttm}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                                  actionLabel="User time tracking mode"
                >
                  <UserTimeTrackingModeForm user_id={user_id} sprint_id={sprint_id}/>
                  <UserTimeTrackingMode sprint_id={sprint_id} user_id={user_id}/>
                  <div className="text-component--empty">No time_tracking_mode</div>
                </EditableProperty>
              </PermissionInspectorHighlighter>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const user = getUser(state, user_id) || {}
    const suttm = getSprintUserTimeTrackingMode(state, sprint_id, user_id)
    const can_view = has_permission(state, sprint.project_id, 'has_view_velocity')
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_velocity')

    return {
        sprint_id,
        sprint,
        project_id: sprint.project_id,
        user_id,
        user,
        suttm,
        can_edit,
        can_view
    }
}

export default connect(mapStateToProps)(EditableUserTimeTrackingMode)
