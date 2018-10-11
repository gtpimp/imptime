import React, {Component} from 'react'
import {connect} from 'react-redux'
import DatePicker from 'react-datepicker'
import PropertyStack from '../PropertyStack'
import PropertyStackComponent from '../PropertyStackComponent'
import { Field, reduxForm } from 'redux-form'
import { getAvailableAutoClockEntity } from '../../actions/AutoClock'
import TextAreaField from '../form/TextAreaField'
import AutoClockInlineIssue from './AutoClockInlineIssue'
import PopupPanelHeading from '../PopupPanelHeading'
import PopupPanelText from '../PopupPanelText'
import PopupPanelButton from '../PopupPanelButton'
import PopupPanelSeparator from '../PopupPanelSeparator'
import { cx, css } from 'emotion'

class AutoClockNewEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
        this.renderDateTimePicker = this.renderDateTimePicker.bind(this)
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

    renderPleaseSelectIssue() {
        const { onCancel } = this.props
        return (
            <div>
              <PopupPanelHeading>
                No issue selected
              </PopupPanelHeading>
              <PopupPanelText>
                Please select an issue first and then come back here.
              </PopupPanelText>
              <PopupPanelButton onClick={onCancel}>
                Close
              </PopupPanelButton>
            </div>
        )
    }

    render() {
        const { handleSubmit, available_project_id, onCancel,
                available_sprint_id, available_issue_id } = this.props

        if ( ! available_issue_id ) {
            return this.renderPleaseSelectIssue()
        }
        
        return (
            <form className="auto-clock-form" onSubmit={handleSubmit}>

              <PopupPanelHeading>
                Create an historic clock entry
              </PopupPanelHeading>
              <PopupPanelText>
                This form allows creating a clock entry where you did not have
                access to ImpTime at that moment.
              </PopupPanelText>

              <PopupPanelSeparator />
              The entry will be created for this issue:
              <AutoClockInlineIssue project_id={available_project_id}
                                    sprint_id={available_sprint_id}
                                    issue_id={available_issue_id} />


              <PopupPanelSeparator strong={true} />
              
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
                  <div className="property-row">
                    <div className="property-label">
                      Description
                    </div>
                    <div className="property-value">
                      <Field name="description" component={this.renderDescriptionField} />
                    </div>
                  </div>
                </PropertyStackComponent>

              </PropertyStack>

              <button type="submit">Create</button>
              <PopupPanelButton onClick={onCancel}>
                Cancel
              </PopupPanelButton>
                
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, onCancel } = props

    const { available_project_id,
            available_sprint_id,
            available_issue_id } = getAvailableAutoClockEntity(state)

    return {
        initialValues: {start_time: null, end_time: null},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        available_project_id,
        available_sprint_id,
        available_issue_id,
        onCancel
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_new_entry_form'})(AutoClockNewEntryForm))
