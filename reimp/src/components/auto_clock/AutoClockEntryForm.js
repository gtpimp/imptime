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
                className="textarea textarea--text-component textarea--title"
                placeholder="Description"
                onChange={input.onChange}
                value={input.value}
            />
        )    
    }
    
    render() {
        const { project, project_id, sprint_id, issue_id, role_options } = this.props

        return (
            <div className="auto-clock-form">

              <div className="auto-clock__available_entity">
                { project_id && 
                  <div className="auto-clock__project">
                    <ProjectName project_id={project_id} />
                  </div>
                }
                { sprint_id && 
                  <div className="auto-clock__sprint">
                    <SprintName sprint_id={sprint_id} />
                  </div>
                }
                { issue_id && 
                  <div className="auto-clock__issue">
                    <IssueName issue_id={issue_id} />
                  </div>
                }
              </div>

              { role_options && role_options.length > 0 && 
                <div className="auto-clock__role">
                  <Field name="role" component={this.renderRoleField} />
                </div>
              }

              <div className="auto-clock__description">
                <Field name="description" component={this.renderDescriptionField} />
              </div>
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, sprint_id, issue_id } = props

    const project = getProject(state, project_id) || {}
    
    const role_options = map(project.logged_in_users_roles || [], function(role) { return ( {value: role, label: role} ) })
    
    return {
        project_id,
        sprint_id,
        issue_id,
        project,
        role_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_entry_form'})(AutoClockEntryForm))
