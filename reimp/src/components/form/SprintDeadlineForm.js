import React, {Component} from 'react'
const  { DOM: { input, select, textarea } } = React
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import { getSprint } from '../../actions/Sprints'
import { getProject } from '../../actions/Projects'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';


class SprintDeadlineForm extends Component {

    constructor(props) {
        super(props)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
        this.renderDeadlineTypeField = this.renderDeadlineTypeField.bind(this)
        this.renderDeadlineDatePicker = this.renderDeadlineDatePicker.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.renderCheckbox = this.renderCheckbox.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    onChangeAndSubmit(e, fieldOnChange) {
        fieldOnChange(e)
    }

    keyDown(event) {
        const { onKeyDown } = this.props
        if (onKeyDown) {
            onKeyDown(event)
        }
    }

    renderDescriptionField(field) {
        const { input } = field
        return (
            <Textarea
                rows="1"
                maxLength="3000"
                className="textarea textarea--text-component textarea--description"
                placeholder="Description"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    renderDeadlineTypeField(field) {
        const { allowed_deadline_types } = this.props
        const { input } = field
        return (
            <Select value={input.value}
                    options={allowed_deadline_types}
                    onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
            />
        )
    }

    renderDeadlineDatePicker(field) {
        const { input } = field
        return (
            <DatePicker selected={input.value}
                        dateFormat="DD MMM YYYY"
                        onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
            />
        )
    }

    renderCheckbox(field) {
        const { input } = field
        return (
            <input type="checkbox" {...input} />
        )
    }

    render() {

        const { deadline, handleSubmit } = this.props

        return (
            <div>
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="sprint_sidebar--textarea">
                    <Field name="description"
                           component={this.renderDescriptionField} />
                  </div>
                  <div className="sprint_sidebar--textarea">
                    <Field name="deadline_type"
                           component={this.renderDeadlineTypeField} />
                  </div>
                  <div className="sprint_sidebar--textarea">
                    <Field name="deadline"
                           component={this.renderDeadlineDatePicker} />
                  </div>
                  <div className="sprint_sidebar--textarea">
                    Is a hard deadline: <Field name="is_hard_deadline" component={this.renderCheckbox} />
                  </div>
                  <div className="sprint_sidebar--textarea">
                    Is the start of the sprint: <Field name="represents_sprint_start" component={this.renderCheckbox} />
                  </div>
                  <div className="sprint_sidebar--textarea">
                    Is the end of the sprint: <Field name="represents_sprint_end" component={this.renderCheckbox} />
                  </div>
                </div>
                <button className="button sprint_sidebar--textarea" type="submit">Submit</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, sprint_id, deadline } = props
    const sprint = getSprint(state, sprint_id)
    
    const project = (sprint.project_id && getProject(state, sprint.project_id)) || {}
    const allowed_deadline_types = project.allowed_deadline_types || []

    return {
        project_id: project.id,
        deadline: deadline,
        initialValues: {deadline:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        allowed_deadline_types
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_deadline_form'})(SprintDeadlineForm))
