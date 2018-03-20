import React, { Component } from 'react'
import { connect } from 'react-redux'
import {browserHistory} from 'react-router'
import keys from 'lodash/keys'
import map from 'lodash/map'
import filter from 'lodash/filter'
import classNames from 'classnames'
import UserRateForm from './form/UserRateForm'
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../actions/Users'
import { getSprint, ensureSprintsLoaded } from '../actions/Sprints'
import { getSprintUserRate, ensureSprintUserRatesLoaded } from '../actions/SprintUserRates'
import '../sass/user-rate.css'
import {
    updateSprintUserRates
} from '../actions/SprintUserRates'

class UserRates extends Component {

    constructor(props) {
        super(props)
        this.onChangeRate = this.onChangeRate.bind(this)
        this.onRemoveUser = this.onRemoveUser.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.user_id != this.props.user_id || new_props.sprint_id != this.props.sprint_id ||
             new_props.user.id != this.props.user.id || new_props.sprint.id != this.props.sprint.id ) {
            this.refresh(new_props.sprint_id, new_props.user_id, new_props.user, new_props.sprint)
        }
    }

    refresh(sprint_id, user_id, user, sprint) {
        const {dispatch} = this.props
        user = user || {}
        sprint = sprint || {}
        sprint_id = sprint_id || this.props.sprint_id
        user_id = user_id || this.props.user_id
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserRatesLoaded(sprint_id, user_id))
    }

    onChangeRate(new_values) {
        const { user_id, sprint_id, dispatch } = this.props

        const rate_values = {}
        map(keys(new_values), (rate_name) => rate_values[rate_name] = new_values[rate_name] === true)

        dispatch(updateSprintUserRates(sprint_id, user_id, rate_values))
    }

    onRemoveUser() {
        const { sprint_id } = this.props
        browserHistory.push('/projects/'+sprint_id+'/users/')
    }

    render() {
        const { user, sprint, sur, is_loading, onChange,
                rate_names, handleSubmit, can_view } = this.props

        return (
            <div className="user-rate">

                <h2>Rates for {user.username} in sprint {sprint.name}</h2>

	                { is_loading &&
                          <div>Loading...</div>
                        }

                        { !is_loading && ! can_view &&
                          <div>You are not allowed to view rates</div>
                        }

                        { !is_loading && can_view &&

                          <UserRateForm rate_names={rate_names}
                                        user_id={user.id}
                                        sprint_id={sprint.id}
                                        onSave={this.onChangeRate} />
                        }

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id, onClose, onChange } = props
    const user = getUser(state, user_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const sur = getSprintUserRate(state, sprint_id, user_id) || {}

    const rate_names = filter(keys(sur), function(o) { return o.startsWith("has_") || o.startsWith('is_') })
    const is_loading = ( ! user.id || ! sprint.id || ! sur.id )
    const logged_in_users_permissions = logged_in_users_permissions(state, sprint_id)
    const can_view = logged_in_users_permissions.can_view_ctc_billable_rates
    
    return {
        onChange: onChange,
        sprint: sprint,
        sprint_id: sprint_id,
	user: user,
	user_id: user_id,
        sur: sur,
        sur_id: sur.id,
        can_view,
        is_loading: is_loading,
        rate_names: rate_names
    }
}

export default connect(mapStateToProps)(UserRates)
