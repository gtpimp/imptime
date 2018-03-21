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
import OtherUser from '../OtherUser'
import SprintName from '../SprintName'
import {change} from 'redux-form'
import {
    getSprintUserVelocity,
    ensureSprintUserVelocityLoaded,
    getLoadingSprintUserVelocityIds,
    getInvalidatedSprintUserVelocityIds
} from '../../actions/SprintUserVelocity'
import '../../sass/popup-form.css'

class UserVelocityForm extends Component {

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
        dispatch(ensureSprintUserVelocityLoaded(sprint_id, user_id))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const { user_id, handleSubmit } = this.props
        fieldOnChange(e)
        setTimeout(function() {handleSubmit()}, 0)
    }

    renderField(field) {
        const { onKeyDown } = this.props
        const {input, data, onChange, ...rest} = field
        return (
            <input
                 onKeyDown={onKeyDown}
                 maxLength="10"
                 placeholder="Velocity"
                 onChange={input.onChange}
                 value={input.value}
                 ref={(ref)=> this.input_el=ref}
             />
        )
    }

    render() {
        const { user_id, sprint_id, suv_id, suv, is_loading, handleSubmit, can_edit, can_view, initialValues, onKeyDown } = this.props
        const that = this;

        if ( ! can_view ) {
            return (<div>No permission to view velocities</div>)
        }
        
        return (
            <div className="popup-form">
              { !suv_id && <div>loading</div> }

              <div className="popup-form__title">
                <div className="popup-form__title__fluff">
                  Edit velocity for
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
                  <Field name="velocity" component={this.renderField}/>
                </div>
                <br/>
                <div className="popup-form__title__fluff">
                  A value of 1 means estimates are perfect.
                  <br/>
                  A value >1 means the user is over-confident.
                  <br/>
                  A value beween 0 and 1 means the user is pessimistic.
                  <br/>
                  If in doubt, go with 1.3.
                </div>
                <br/>
                <button type="submit" className="popup-form__submit button button-primary">Save</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, sprint_id, user_id, onSave } = props
    const user = getUser(state, user_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const suv = getSprintUserVelocity(state, sprint_id, user_id) || {}

    const loading_suv_ids = getLoadingSprintUserVelocityIds(state) || []
    const invalidated_suv_ids = getInvalidatedSprintUserVelocityIds(state) || []
    
    const is_loading = ! user.id || ! sprint.id || ! suv.id || includes(loading_suv_ids, suv.id)
    const is_invalidated = includes(invalidated_suv_ids, suv.id)
 
    const initialValues = { velocity: suv.velocity}
    const can_view = logged_in_users_permissions(state, sprint.project_id).has_view_velocity
    const can_edit = logged_in_users_permissions(state, sprint.project_id).has_edit_velocity
    
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
        suv,
        suv_id: suv.id,
        is_loading,
        is_invalidated
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_velocity_form'})(UserVelocityForm))
