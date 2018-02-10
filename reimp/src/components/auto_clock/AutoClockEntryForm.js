import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
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
        this.clockProject = this.clockProject.bind(this)
        this.clockSprint = this.clockSprint.bind(this)
        this.clockIssue = this.clockIssue.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    clockProject(new_values) {
        const { onSubmit, dispatch, project_id } = this.props
        onSubmit({...new_values,
                  project_id:project_id,
                  sprint_id:null,
                  issue_id:null})
    }

    clockSprint(new_values) {
        const { onSubmit, dispatch, project_id, sprint_id } = this.props
        onSubmit({...new_values,
                  project_id:project_id,
                  sprint_id:sprint_id,
                  issue_id:null})
    }

    clockIssue(new_values) {
        const { onSubmit, dispatch, project_id, sprint_id, issue_id } = this.props
        onSubmit({...new_values,
                  project_id:project_id,
                  sprint_id:sprint_id,
                  issue_id:issue_id})
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

    render() {
        const { handleSubmit, project, project_id, sprint_id, issue_id, role_options } = this.props

        return (
            <form className="auto-clock-form">

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

              <div className="auto-clock-entry__clockables">
                { project_id &&
                  <div className="auto-clock-entry__clockable">
                    <div className="auto-clock-entry__label">
                      Project:
                    </div>
                    <div className="auto-clock-entry__field auto-clock-entry__project_name">
                      <ProjectName project_id={project_id} />
                    </div>
                    <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockProject)} />
                  </div>
                }

                { sprint_id &&
                  <div className="auto-clock-entry__clockable">
                    <div className="auto-clock-entry__label">
                      Sprint:
                    </div>
                    <div className="auto-clock-entry__field auto-clock-entry__sprint_name">
                      <SprintName sprint_id={sprint_id} />
                    </div>
                    <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockSprint)} />
                  </div>
                }

                { issue_id &&
                  <div className="auto-clock-entry__clockable">
                    <div className="auto-clock-entry__label">
                      Issue:
                    </div>
                    <div className="auto-clock-entry__field auto-clock-entry__issue_name">
                      <IssueName issue_id={issue_id} />
                    </div>
                    <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockIssue)} />
                  </div>
                }
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
