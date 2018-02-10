import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { Field, reduxForm } from 'redux-form'
import FileUploader from '../form/FileUploader'
import FileLabel from '../form/FileLabel'
import { UPLOAD_RELATIVE_URL } from '../../actions/VisualSpecDocuments'
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
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { available_project_id, dispatch } = props
        dispatch(ensureProjectsLoaded([available_project_id]))
    }

    renderRoleField(field) {
        const { role_options } = this.props
        const {input, data, onChange, ...rest} = field
        return (
            <div>
            {
                map(role_options, function(option) {
                    return (
                        <label key={option.value}>
                          <input type="radio"
                                 name="role"
                                 value={option.value}
                                 onChange={input.onChange}
                                 checked={input.value && input.value == option.value} />
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
    
    render() {
        const { handleSubmit, project, project_id, sprint_id, issue_id, role_options } = this.props

        return (
            <form onSubmit={handleSubmit} className="auto-clock-form">

              <AutoClockEntity project_id={project_id}
                               sprint_id={sprint_id}
                               issue_id={issue_id} />

              { role_options && role_options.length > 0 && 
                <div className="auto-clock__role">
                  <Field name="role" component={this.renderRoleField} />
                </div>
              }

              <div className="auto-clock__description">
                <Field name="description" component={this.renderDescriptionField} />
              </div>

              <div className="auto-clock__actions">
                <button className="button" type="submit">Clock In</button>
              </div>
                
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, project_id, sprint_id, issue_id } = props

    const project = getProject(state, project_id) || {}
    
    const role_options = map(project.logged_in_users_roles || [], function(role) { return ( {value: role, label: role} ) })
    
    return {
        initialValues: {project_id: project_id,
                        sprint_id: sprint_id,
                        issue_id: issue_id,
                        role: project.logged_in_users_default_role},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        project_id,
        sprint_id,
        issue_id,
        project,
        role_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_entry_form'})(AutoClockEntryForm))
