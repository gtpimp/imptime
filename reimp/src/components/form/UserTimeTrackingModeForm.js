import React, { Component } from 'react'
import { connect } from 'react-redux'
import map from 'lodash/map'
import includes from 'lodash/includes'
import { reduxForm, Field } from 'redux-form';
import { getUser, ensureUsersLoaded, logged_in_users_permissions } from '../../actions/Users'
import { getSprint, ensureSprintsLoaded } from '../../actions/Sprints'
import OtherUser from '../OtherUser'
import SprintName from '../SprintName'
import {
    getSprintUserTimeTrackingMode,
    ensureSprintUserTimeTrackingModeLoaded,
    getLoadingSprintUserTimeTrackingModeIds,
    getInvalidatedSprintUserTimeTrackingModeIds
} from '../../actions/SprintUserTimeTrackingMode'
import '../../sass/popup-form.css'

const TIME_TRACKING_MODES = [ "developer", "tester", "manager" ]

class UserTimeTrackingModeForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.renderField = this.renderField.bind(this)
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
        dispatch(ensureSprintUserTimeTrackingModeLoaded(sprint_id, user_id))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const { handleSubmit } = this.props
        fieldOnChange(e)
        setTimeout(function() {handleSubmit()}, 0)
    }

    renderField(field) {
        const {input} = field
        return (
            <div>
              {map(TIME_TRACKING_MODES, (time_tracking_mode) =>
                  <div key={time_tracking_mode}>
                    <label>{time_tracking_mode}
                      <input
                          type="radio"
                          onChange={input.onChange}
                          value={time_tracking_mode}
                      />
                    </label>
                  </div>
               )}
            </div>
        )
    }

    render() {
        const { user_id, sprint_id, suv_id, handleSubmit, can_view } = this.props

        if ( ! can_view ) {
            return (<div>No permission to view time tracking modes</div>)
        }
        
        return (
            <div className="popup-form">
              { !suv_id && <div>loading</div> }

              <div className="popup-form__title">
                <div className="popup-form__title__fluff">
                  Edit time tracking mode for
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
                  <Field name="time_tracking_mode" component={this.renderField}/>
                </div>
                <br/>
                <div className="popup-form__title__fluff">
                  Developers estimate their own time
                  <br/>
                  Tester's time is automatically estimated based on the developer's time.
                  <br/>
                  Manager's time is automatically estimated based on a ratio of the developer's time.
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
    const suv = getSprintUserTimeTrackingMode(state, sprint_id, user_id) || {}

    const loading_suv_ids = getLoadingSprintUserTimeTrackingModeIds(state) || []
    const invalidated_suv_ids = getInvalidatedSprintUserTimeTrackingModeIds(state) || []
    
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

export default connect(mapStateToProps)(reduxForm({form:'sprint_velocity_form'})(UserTimeTrackingModeForm))
