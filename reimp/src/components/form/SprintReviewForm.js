import React, {Component} from 'react'
const  { DOM: { input, select, textarea } } = React
import {connect} from 'react-redux'
import PropertyStack from '../PropertyStack'
import PropertyStackComponent from '../PropertyStackComponent'
import { Field, reduxForm } from 'redux-form';
import Textarea from 'react-expanding-textarea'
import { getSprint, ensureSprintsLoaded } from '../../actions/Sprints'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import DatePicker from 'react-datepicker';
import UserDropdown from './UserDropdown';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

const required = value => value ? undefined : 'Required'

class SprintReviewForm extends Component {

    constructor(props) {
        super(props)
        this.renderUserField = this.renderUserField.bind(this)
        this.renderDaysField = this.renderDaysField.bind(this)
        this.renderCheckbox = this.renderCheckbox.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWithReceiveProps() {
        this.refresh(this.props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, sprint_id, project_id } = props
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
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
        const { reviewable_user_ids } = this.props
        const { input } = field
        return (
            <UserDropdown user_ids={reviewable_user_ids}
                          onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                          value={input.value} />
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

    renderCheckbox(field) {
        const { input } = field
        return (
            <input type="checkbox"
                   checked={input.value}
                   onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}/>
        )
    }

    render() {

        const { review, handleSubmit } = this.props
        return (
            <div>
              <form onSubmit={handleSubmit}>
                <div>
                  <PropertyStack>
                    <PropertyStackComponent title="Reviewer">
                    </PropertyStackComponent>
                    <Field name="review_by_id"
                           validate={[required]}
                           component={this.renderUserField} />
                    <PropertyStackComponent title="Days between each review">
                      <Field name="review_cycle_days"
                             validate={[required]}
                             component={this.renderDaysField} />
                    </PropertyStackComponent>
                    <PropertyStackComponent title="Must always review">
                      <Field name="must_always_review"
                             component={this.renderCheckbox} />
                    </PropertyStackComponent>
                  </PropertyStack>
                </div>
                <button className="button sprint_sidebar--textarea" type="submit">Submit</button>
              </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSubmitted, sprint_id, sprint_review } = props
    const sprint = getSprint(state, sprint_id)
    const project = getProject(state, sprint.project_id) || {}
    const reviewable_user_ids = (project && project.allowed_user_ids) || []
    const initial_values = sprint_review || {}
    
    return {
        initialValues: initial_values,
        enableReinitialize: true,
        onSubmit: onSubmitted,
        reviewable_user_ids,
        sprint_id,
        project_id: (sprint || {}).project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_review_form'})(SprintReviewForm))
