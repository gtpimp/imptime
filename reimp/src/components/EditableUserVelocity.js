import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import { has_permission } from '../actions/Users'
import { ensureSprintUserVelocityLoaded, getSprintUserVelocity, updateSprintUserVelocities } from '../actions/SprintUserVelocity'
import UserVelocityForm from './form/UserVelocityForm'
import UserVelocity from './UserVelocity'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import { getUser, ensureUsersLoaded } from '../actions/Users'

class EditableUserVelocity extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        const { dispatch, sprint_id, user_id} = this.props
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserVelocityLoaded(sprint_id, user_id))
    }
    
    onChange(new_values) {
        const { dispatch, sprint_id, user_id } = this.props
        dispatch(updateSprintUserVelocities([sprint_id], [user_id], new_values))
    }
    
    render() {
        const { sprint_id, user_id, suv, can_edit } = this.props

        return (
            <EditableProperty property_key={'user_velocity_name_'+sprint_id + "_" + user_id}
                              initial_value={suv}
                              edit_as_modal={true}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              actionLabel="User velocity"
            >
              <UserVelocityForm user_id={user_id} sprint_id={sprint_id}/>
              <UserVelocity sprint_id={sprint_id} user_id={user_id}/>
              <div className="text-component--empty">No velocity</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const user = getUser(state, user_id) || {}
    const suv = getSprintUserVelocity(state, sprint_id, user_id)
    const can_view = has_permission(state, sprint.project_id, 'has_view_velocity')
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_velocity')

    return {
        sprint_id,
        sprint,
        user_id,
        user,
        suv,
        can_edit,
        can_view
    }
}

export default connect(mapStateToProps)(EditableUserVelocity)
