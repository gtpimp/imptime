import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import { map } from 'lodash'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { css, cx } from 'emotion'
import { Field, reduxForm } from 'redux-form'
import { getAutoClock,
         getAvailableAutoClockEntity,
         ensureAutoClocksLoaded,
         updateAutoClocks } from '../../actions/AutoClock'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import AutoClockEntry from './AutoClockEntry'
import AutoClockInlineIssue from './AutoClockInlineIssue'
import PopupPanelButton from '../PopupPanelButton'
import PopupPanelHeading from '../PopupPanelHeading'
import PopupPanelText from '../PopupPanelText'
import PopupPanelSeparator from '../PopupPanelSeparator'
import IssueSelectorForm from '../form/IssueSelectorForm'
import TextAreaField from '../form/TextAreaField'
import PropertyStackComponent from '../PropertyStackComponent'
import PropertyStack from '../PropertyStack'

class AutoClockEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
        this.renderDateTimePicker = this.renderDateTimePicker.bind(this)
        this.onStartAssignToNewIssue = this.onStartAssignToNewIssue.bind(this)
        this.onStopAssignToNewIssue = this.onStopAssignToNewIssue.bind(this)
        this.onCreatedNewIssueForAssignToEntry = this.onCreatedNewIssueForAssignToEntry.bind(this)
        this.onSelectedIssueForAssignToEntry = this.onSelectedIssueForAssignToEntry.bind(this)
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

    onSelectedIssueForAssignToEntry(issue_id) {
        const { dispatch, entry, onClose } = this.props
        if ( ! window.confirm("Assign this entry to this issue?") ) {
            return false
        }
        dispatch(updateAutoClocks([entry.id], {issue_id:issue_id}))
        this.onStopAssignToNewIssue()
        onClose()
    }

    renderDescriptionField(field) {
        const {input} = field
        return (
            <TextAreaField
                rows="3"
                className="textarea textarea--text-component textarea--description"
                placeholder="Description"
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
              <IssueSelectorForm onSubmitted={this.onCreatedNewIssueForAssignToEntry}
                                 optional_default_issue_values={{project_id:entry.project_id,
                                                                 sprint_id:entry.sprint_id}} />
                               
              <PopupPanelButton onClick={this.onStopAssignToNewIssue}>
                Cancel
              </PopupPanelButton>
            </div>
        )
    }

    renderAvailableIssueForAssigning() {
        const { available_project_id,
                available_sprint_id,
                available_issue_id } = this.props

        if (! available_issue_id ) {
            return null
        }
        
        return (
            <div>
              <PopupPanelText>
                This is the most recently selected issue, click to assign the entry to it.
              </PopupPanelText>
              <AutoClockInlineIssue project_id={available_project_id}
                                    sprint_id={available_sprint_id}
                                    issue_id={available_issue_id}
                                    onSelect={() => this.onSelectedIssueForAssignToEntry(available_issue_id)} />
            </div>
        )
    }

    renderFlatForm() {
        const { handleSubmit, entry_id, onDelete, available_issue_id } = this.props

        return (
            <form className="auto-clock-form" onSubmit={handleSubmit}>

              <PopupPanelHeading>
                Editing an existing clock 
              </PopupPanelHeading>
              <AutoClockEntry entry_id={entry_id} />
              <PopupPanelSeparator strong={true} />

              { available_issue_id &&
                <div>
                  <PopupPanelHeading>
                    Assign to an issue
                  </PopupPanelHeading>
                  { this.renderAvailableIssueForAssigning() }
                  <PopupPanelHeading>
                    Or
                  </PopupPanelHeading>
                </div>
              }
              <PopupPanelButton onClick={this.onStartAssignToNewIssue}>
                Find or create an issue for this entry
              </PopupPanelButton>
              <PopupPanelSeparator strong={true} />

              <PopupPanelHeading>
                Correct the timing with an optional comment
              </PopupPanelHeading>
              <PropertyStack>
                <PropertyStackComponent>
                  <div className="property-row">
                    <div className={cx("property-cell", css`width:25%`)}>
                      Start:
                    </div>
                    <div className={cx("property-cell", css`width:75%`)}>
                      <Field name="start_time" component={this.renderDateTimePicker} />
                    </div>
                  </div>
                  <div className="property-row">
                    <div className={cx("property-cell", css`width:25%`)}>
                      End:
                    </div>
                    <div className={cx("property-cell", css`width:75%`)}>
                      <Field name="end_time" component={this.renderDateTimePicker} />
                    </div>
                  </div>
                </PropertyStackComponent>
              </PropertyStack>

              <div className="auto-clock__form">
                <div className="auto-clock__form__description">
                  <Field name="description" component={this.renderDescriptionField} />
                </div>
              </div>
              
              <button type="submit" className="button">Save</button>

              <PopupPanelSeparator strong={true} />
              
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

    const { available_project_id,
            available_sprint_id,
            available_issue_id } = getAvailableAutoClockEntity(state)
    
    return {
        initialValues: {start_time: moment(entry.start_time),
                        end_time: moment(entry.end_time),
                        description: entry.comments,
                        role_name: entry.role_name},
        enableReinitialize: false,
        onSubmit: onSubmitted,
        onDelete,
        onClose,
        project,
        project_id,
        entry,
        entry_id,
        role_options,
        available_project_id,
        available_sprint_id,
        available_issue_id,
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_entry_form'})(AutoClockEntryForm))
