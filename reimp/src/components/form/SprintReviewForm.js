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

const required = value => value ? undefined : 'Required'

class SprintReviewForm extends Component {

    constructor(props) {
        super(props)
        this.renderUserField = this.renderUserField.bind(this)
        this.renderDaysField = this.renderDaysField.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
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

    renderUserField(field) {
        const { input } = field
        return (
            <input
                className="textarea textarea--text-component textarea--description"
                placeholder="Reviewer"
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                onKeyDown={this.keyDown}
            />
        )
    }

    renderDaysField(field) {
        const { input } = field
        return (
            <input className="textarea textarea--text-component textarea--description"
                   value={input.value}
                   placeholder="Days before review is due"
                   onKeyDown={this.keyDown}
                   onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
            />
        )
    }

    render() {

        const { review, handleSubmit } = this.props

        return (
            <div>
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="sprint_sidebar--textarea">
                    <Field name="review_by"
                           validate={[required]}
                           component={this.renderUserField} />
                  </div>
                  <div className="sprint_sidebar--textarea">
                    <Field name="review_cycle_days"
                           validate={[required]}
                           component={this.renderDaysField} />
                  </div>
                </div>
                <button className="button sprint_sidebar--textarea" type="submit">Submit</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, sprint_id, review } = props
    const sprint = getSprint(state, sprint_id)
    const initial_values = review || {}
    
    return {
        review: review,
        initialValues: initial_values,
        enableReinitialize: true,
        onSubmit: onSubmitted
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_review_form'})(SprintReviewForm))
