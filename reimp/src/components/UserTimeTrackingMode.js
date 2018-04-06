import React, {Component} from 'react'
import {connect} from 'react-redux'
import { has_permission } from '../actions/Users'
import { ensureUsersLoaded } from '../actions/Users'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import {
    getSprintUserTimeTrackingMode,
    ensureSprintUserTimeTrackingModeLoaded,
    isSuttmInvalidated,
    isSuttmLoading
} from '../actions/SprintUserTimeTrackingMode'

class UserTimeTrackingMode extends Component {

    componentDidMount() {
        this.refresh()
    }
    
    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, sprint_id, user_id} = props
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserTimeTrackingModeLoaded(sprint_id, user_id))
    }
    
    render() {
        const { value } = this.props
        return (
            <div>
              {value}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id } = props

    const sprint = getSprint(state, sprint_id) || {}
    const suttm = getSprintUserTimeTrackingMode(state, sprint_id, user_id) || {}
    const can_view = has_permission(state, sprint.project_id, "has_view_velocity")
    const is_invalidated = isSuttmInvalidated(state, suttm.id)
    const is_loading = isSuttmLoading(state, suttm.id)
    
    return {
        value: suttm.time_tracking_mode,
        can_view,
        is_invalidated,
        is_loading
    }
}

export default connect(mapStateToProps)(UserTimeTrackingMode)
