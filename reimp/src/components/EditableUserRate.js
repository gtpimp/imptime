import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import { has_permission } from '../actions/Users'
import { ensureSprintUserRateLoaded, getSprintUserRate, updateSprintUserRates } from '../actions/SprintUserRates'
import UserRateForm from './form/UserRateForm'
import UserRate from './UserRate'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import { getUser, ensureUsersLoaded } from '../actions/Users'

class EditableUserRate extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        const { dispatch, sprint_id, user_id} = this.props
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserRateLoaded(sprint_id, user_id))
    }
    
    onChange(new_values) {
        const { dispatch, sprint_id, user_id } = this.props
        dispatch(updateSprintUserRates([sprint_id], [user_id], new_values))
    }
    
    render() {
        const { sprint_id, user_id, sur, can_edit } = this.props

        return (
            <EditableProperty property_key={'user_rate_name_'+sprint_id + "_" + user_id}
                              initial_value={sur}
                              edit_as_modal={true}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              actionLabel="User rate"
            >
              <UserRateForm user_id={user_id} sprint_id={sprint_id}/>
              <UserRate user_id={user_id} sprint_id={sprint_id} />
              <div className="text-component--empty">No rate</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id } = props
    const sprint = getSprint(state, sprint_id) || {}
    const user = getUser(state, user_id) || {}
    const sur = getSprintUserRate(state, sprint_id, user_id)
    const can_view = has_permission(state, sprint.project_id, 'has_view_ctc_billable_rates')
    const can_edit = has_permission(state, sprint.project_id, 'has_edit_ctc_billable_rates')

    return {
        sprint_id,
        sprint,
        user_id,
        user,
        sur,
        can_edit,
        can_view
    }
}

export default connect(mapStateToProps)(EditableUserRate)
