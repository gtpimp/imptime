import React, { Component } from 'react'
import { connect } from 'react-redux'
import includes from 'lodash/includes'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../../actions/Users'
import { getSprint, ensureSprintsLoaded } from '../../actions/Sprints'
import OtherUser from '../OtherUser'
import SprintName from '../SprintName'
import {
    getSprintUserRate,
    ensureSprintUserRateLoaded,
    getLoadingSprintUserRateIds,
    getInvalidatedSprintUserRateIds
} from '../../actions/SprintUserRates'
import '../../sass/popup-form.css'

class UserRateForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.renderField = this.renderField.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
        this.input_el && this.input_el.focus()
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
        dispatch(ensureSprintUserRateLoaded(sprint_id, user_id))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const { handleSubmit } = this.props
        fieldOnChange(e)
        setTimeout(function() {handleSubmit()}, 0)
    }

    renderField(field) {
        const { onKeyDown } = this.props
        const {input} = field
        return (
            <input
                 onKeyDown={onKeyDown}
                 maxLength="10"
                 placeholder="Billable amount"
                 onChange={input.onChange}
                 value={input.value}
                 ref={(ref)=> this.input_el=ref}
             />
        )
    }

    render() {
        const { user_id, sprint_id, sur_id, handleSubmit, can_view } = this.props

        if ( ! can_view ) {
            return (<div>No permission to view rates</div>)
        }
        
        return (
            <div className="popup-form">
              { !sur_id && <div>loading</div> }

              <div className="popup-form__title">
                <div className="popup-form__title__fluff">
                  Edit rates for
                </div>
                <div className="popup-form__title__value">
                  <OtherUser value={user_id} />
                </div>
                <div className="popup-form__title__fluff">
                  within sprint
                </div>
                <div className="popup-form__title__value">
                  <SprintName sprint_id={sprint_id}/>
                </div>
              </div>
              <br/>
              <form onSubmit={handleSubmit}>
                <div>
                  R<Field name="billable_amount" component={this.renderField}/>
                </div>
                <br/>
                <button type="submit" className="popup-form__submit button button-primary">Save</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, sprint_id, user_id } = props
    const user = getUser(state, user_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const sur = getSprintUserRate(state, sprint_id, user_id) || {}

    const loading_sur_ids = getLoadingSprintUserRateIds(state) || []
    const invalidated_sur_ids = getInvalidatedSprintUserRateIds(state) || []
    
    const is_loading = ! user.id || ! sprint.id || ! sur.id || includes(loading_sur_ids, sur.id)
    const is_invalidated = includes(invalidated_sur_ids, sur.id)
 
    const initialValues = { billable_amount: sur.billable_amount}
    const can_view = logged_in_users_permissions(state, sprint.project_id).has_view_ctc_billable_rates
    const can_edit = logged_in_users_permissions(state, sprint.project_id).has_edit_ctc_billable_rates
    
    return {
        can_view,
        can_edit,
        initialValues,
        onSubmit: onSubmitted,
        enableReinitialize: true,
        sprint,
        sprint_id,
        user,
        user_id,
        sur,
        sur_id: sur.id,
        is_loading,
        is_invalidated
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_rate_form'})(UserRateForm))
