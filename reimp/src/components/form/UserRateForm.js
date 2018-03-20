import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import includes from 'lodash/includes'
import filter from 'lodash/filter'
import classNames from 'classnames'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../../actions/Users'
import { getSprint, ensureSprintsLoaded } from '../../actions/Sprints'
import {change} from 'redux-form'
import {
    getSprintUserRate,
    ensureSprintUserRatesLoaded,
    getLoadingSprintUserRateIds,
    getInvalidatedSprintUserRateIds
} from '../../actions/SprintUserRates'
import '../../sass/user-rate.css'

class UserRateForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props.sprint_id, new_props.user_id)
    }

    refresh(sprint_id, user_id) {
        const {dispatch} = this.props
        sprint_id = sprint_id || this.props.sprint_id
        user_id = user_id || this.props.user_id
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureSprintUserRatesLoaded(sprint_id, user_id))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const { user_id, handleSubmit } = this.props
        fieldOnChange(e)
        setTimeout(function() {handleSubmit()}, 0)
    }

    render() {
        const { sur_id, sur, is_loading, rate_names, handleSubmit, can_edit, can_view, initialValues } = this.props
        const that = this;

        if ( ! can_view ) {
            return (<div>"No permission to view rates"</div>)
        }
        
        return (
            <div className="user-rate">
              { !sur_id && <div>loading</div> }

              <form onSubmit={handleSubmit}>

                <div className="user-rate__rate_list">
                </div>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { sprint_id, user_id, onClose, onSave, onRemoveUser, rate_names } = props
    const user = getUser(state, user_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const sur = getSprintUserRate(state, sprint_id, user_id) || {}

    const loading_sur_ids = getLoadingSprintUserRateIds(state) || []
    const invalidated_sur_ids = getInvalidatedSprintUserRateIds(state) || []
    
    const is_loading = ! user.id || ! sprint.id || ! sur.id || includes(loading_sur_ids, sur.id)
    const is_invalidated = includes(invalidated_sur_ids, sur.id)
 
    const initialValues = {}
    map(rate_names, (rate_name) => { initialValues[rate_name] = sur[rate_name] })
    const can_view = logged_in_users_permissions(state, sprint_id).can_view_ctc_billable_rates
    const can_edit = logged_in_users_permissions(state, sprint_id).can_edit_ctc_billable_rates
    
    return {
        can_view,
        can_edit,
        initialValues,
        onSubmit: onSave,
        onRemoveUser,
        enableReinitialize: true,
        sprint,
        sprint_id,
        user,
        user_id,
        sur,
        sur_id: sur.id,
        rate_names,
        is_loading,
        is_invalidated
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_rate_form'})(UserRateForm))
