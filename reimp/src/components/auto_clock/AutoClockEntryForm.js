import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import classNames from 'classnames'
import { map } from 'lodash'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Field, reduxForm } from 'redux-form'
import { getAutoClock, ensureAutoClocksLoaded, updateAutoClocks } from '../../actions/AutoClock'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import AutoClockEntry from './AutoClockEntry'
import PopupPanelButton from '../PopupPanelButton'
import NewIssueSidebar from '../NewIssueSidebar'

class AutoClockEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderRoleField = this.renderRoleField.bind(this)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
        this.renderDateTimePicker = this.renderDateTimePicker.bind(this)
        this.onStartAssignToNewIssue = this.onStartAssignToNewIssue.bind(this)
        this.onStopAssignToNewIssue = this.onStopAssignToNewIssue.bind(this)
        this.onCreatedNewIssueForAssignToEntry = this.onCreatedNewIssueForAssignToEntry.bind(this)
        this.state = { assigning_to_new_issue: false }
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

    onStartAssignToNewIssue() {
        this.setState({assigning_to_new_issue:true})
    }

    onStopAssignToNewIssue() {
        this.setState({assigning_to_new_issue:false})
    }

    onCreatedNewIssueForAssignToEntry(issues_ids, sprint_id, project_id) {
        const { dispatch, entry, onClose } = this.props
        const issue_id = issues_ids[0]
        dispatch(updateAutoClocks([entry.id], {issue_id:issue_id}))
        this.onStopAssignToNewIssue()
        onClose()
    }

    renderRoleField(field) {
        const { role_options } = this.props
        const {input} = field
        return (
            <div>
              {
                  map(role_options, function(option) {
                      const checked = input.value && input.value === option.value
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
        const {input} = field
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
        const {input} = field
        return (
            <DatePicker selected={input.value}
                        dateFormat="LLL"
                        showTimeSelect={true}
                        timeFormat="HH:mm"
                        timeIntervals={5}
                        onChange={input.onChange} />
        )
    }

    renderAssignToNewIssue() {
        const { entry } = this.props
        return (
            <div>
              Assigning to new issue

              <NewIssueSidebar project_id={entry.project_id}
                               sprint_id={entry.sprint_id}
                               onCreatedIssues={this.onCreatedNewIssueForAssignToEntry} />
                               
              <PopupPanelButton onClick={this.onStopAssignToNewIssue}>
                Cancel
              </PopupPanelButton>
            </div>
        )
    }

    renderFlatForm() {
        const { handleSubmit, entry_id, onDelete, role_options } = this.props

        return (
            <form className="auto-clock-form" onSubmit={handleSubmit}>

              <AutoClockEntry entry_id={entry_id} />

              <PopupPanelButton onClick={this.onStartAssignToNewIssue}>
                Assign to a new issue
              </PopupPanelButton>
              
              <div className="auto-clock__form">
                { role_options && role_options.length > 0 &&
                  <div className="auto-clock__role">
                    <Field name="role_name" component={this.renderRoleField} />
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
              <button className="button" onClick={onDelete}>Delete</button>
              
            </form>
        )        
    }

    render() {

        const { assigning_to_new_issue } = this.state
        return (
            <div>
              { assigning_to_new_issue && this.renderAssignToNewIssue() }
              { !assigning_to_new_issue && this.renderFlatForm() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onDelete, onClose, entry_id } = props

    const entry = getAutoClock(state, entry_id) || {}
    const project_id = entry.project_id
    const project = getProject(state, project_id) || {}
    const role_options = map(project.logged_in_users_roles || [], function(role) { return ( {value: role, label: role} ) })

    return {
        initialValues: {start_time: moment(entry.start_time),
                        end_time: moment(entry.end_time),
                        description: entry.comments,
                        role_name: entry.role_name},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        onDelete,
        onClose,
        project,
        project_id,
        entry,
        entry_id,
        role_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_entry_form'})(AutoClockEntryForm))
