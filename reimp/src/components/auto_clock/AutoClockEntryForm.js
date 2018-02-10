import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import classNames from 'classnames'
import { map } from 'lodash'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Field, reduxForm } from 'redux-form'
import { UPLOAD_RELATIVE_URL } from '../../actions/VisualSpecDocuments'
import { getAutoClock, ensureAutoClocksLoaded } from '../../actions/AutoClock'
import ProjectName from '../ProjectName'
import SprintName from '../SprintName'
import IssueName from '../IssueName'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import AutoClockEntity from './AutoClockEntity'

class AutoClockEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderRoleField = this.renderRoleField.bind(this)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
        this.renderDateTimePicker = this.renderDateTimePicker.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { entry_id, project_id, dispatch } = props
        dispatch(ensureAutoClocksLoaded([entry_id]))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    renderRoleField(field) {
        const { role_options } = this.props
        const {input, data, onChange, ...rest} = field
        return (
            <div>
              {
                  map(role_options, function(option) {
                      const checked = input.value && input.value == option.value
                      return (
                          <label key={option.value}
                                 className={classNames("auto-clock__radio",
                                                       {"auto-clock__radio--checked":checked,
                                                        "auto-clock__radio--unchecked":!checked})}>
                            <input type="radio"
                                   name="role"
                                   value={option.value}
                                   onChange={input.onChange}
                                   checked={checked} />
                            {option.label}
                          </label>
                      )
                  })
              }
            </div>
        )
    }

    renderDescriptionField(field) {
        const {input, data, onChange, ...rest} = field
        return (
            <input
                maxLength="100"
                className="textarea textarea--text-component"
                placeholder="Optional description"
                onChange={input.onChange}
                value={input.value}
            />
        )
    }

    renderDateTimePicker(field) {
        const {input, data, onChange, ...rest} = field
        return (
            <DatePicker selected={input.value}
                        dateFormat="LLL"
                        showTimeSelect={true}
                        timeFormat="HH:mm"
                        timeIntervals={5}
                        onChange={input.onChange} />
        )
    }

    render() {
        const { handleSubmit, project, project_id, role_options } = this.props

        return (
            <form className="auto-clock-form" onSubmit={handleSubmit}>

              <div className="auto-clock__form__row1">
                  { role_options && role_options.length > 0 &&
                    <div className="auto-clock__role">
                      <Field name="role" component={this.renderRoleField} />
                    </div>
                  }

                  <div className="auto-clock__form__description">
                    <Field name="description" component={this.renderDescriptionField} />
                  </div>
              </div>

              <div className="auto-clock__form__start">
                Start: 
                <Field name="start_time" component={this.renderDateTimePicker} />
              </div>
              <div className="auto-clock__form__end">
                End:
                <Field name="end_time" component={this.renderDateTimePicker} />
              </div>
              
              <button type="submit" className="button">Save</button>
                
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, entry_id } = props

    const entry = getAutoClock(state, entry_id) || {}
    const project_id = entry.project_id
    const project = getProject(state, project_id) || {}
    const role_options = map(project.logged_in_users_roles || [], function(role) { return ( {value: role, label: role} ) })

    return {
        initialValues: {start_time: moment(entry.start_time),
                        end_time: moment(entry.end_time),
                        description: entry.comments,
                        role: entry.role_name},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        project: project,
        project_id: project_id,
        entry: entry,
        entry_id: entry_id,
        role_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_entry_form'})(AutoClockEntryForm))
