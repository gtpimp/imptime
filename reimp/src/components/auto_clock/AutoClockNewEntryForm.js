import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import PropertyStack from '../PropertyStack'
import PropertyStackComponent from '../PropertyStackComponent'
import { map } from 'lodash'
import { Field, reduxForm } from 'redux-form'
import ProjectName from '../ProjectName'
import SprintName from '../SprintName'
import IssueName from '../IssueName'
import { getProject, ensureProjectsLoaded } from '../../actions/Projects'
import { getPreferredRole } from '../../actions/AutoClock'
import Floater from 'react-floater'

class AutoClockNewEntryForm extends Component {

    constructor(props) {
        super(props)
        this.renderRoleField = this.renderRoleField.bind(this)
        this.renderDescriptionField = this.renderDescriptionField.bind(this)
        this.clockProject = this.clockProject.bind(this)
        this.clockSprint = this.clockSprint.bind(this)
        this.clockIssue = this.clockIssue.bind(this)
        this.clockAdmin = this.clockAdmin.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    clockProject(new_values) {
        const { onSubmit, project_id } = this.props
        onSubmit({...new_values,
                  project_id:project_id,
                  sprint_id:null,
                  issue_id:null})
    }

    clockSprint(new_values) {
        const { onSubmit, project_id, sprint_id } = this.props
        onSubmit({...new_values,
                  project_id:project_id,
                  sprint_id:sprint_id,
                  issue_id:null})
    }

    clockIssue(new_values) {
        const { onSubmit, project_id, sprint_id, issue_id } = this.props
        onSubmit({...new_values,
                  project_id:project_id,
                  sprint_id:sprint_id,
                  issue_id:issue_id})
    }

    clockAdmin() {
        const { onSubmit } = this.props
        onSubmit({project_name: 'admin'})
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { available_project_id, dispatch } = props
        dispatch(ensureProjectsLoaded([available_project_id]))
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

    render() {
        const { handleSubmit, project_id, sprint_id, issue_id,
                can_clock_admin, role_options } = this.props

        return (
            <form className="auto-clock-form">

              <PropertyStack>

                <PropertyStackComponent>
                
                  { role_options && role_options.length > 0 &&
                    <div className="property-row">
                      <div className="property-label">
                        Role
                      </div>
                      <div className="property-value">
                        <Field name="role" component={this.renderRoleField} />
                      </div>
                    </div>
                  }
                  <div className="property-row">
                    <div className="property-label">
                      Description
                    </div>
                    <div className="property-value">
                      <Field name="description" component={this.renderDescriptionField} />
                    </div>
                  </div>
                </PropertyStackComponent>

                { project_id &&
                  <Floater title="Clock in project"
                           disableHoverToClick
                           event="hover"
                           eventDelay={0}
                           placement="right"
                           content={"Clocking into a project uses the most recent active sprint will be used."}>

                    <PropertyStackComponent>
                      <div className="property-row">
                        <div className="property-label">
                          Project
                        </div>
                        <div className="property-row">
                          <div className="property-value">
                            <ProjectName project_id={project_id} />
                            <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockProject)} />
                          </div>
                        </div>
                      </div>
                    </PropertyStackComponent>
                  </Floater>
                }

                { sprint_id &&
                  <PropertyStackComponent>
                    <Floater title="Clock in sprint"
                             disableHoverToClick
                             event="hover"
                             eventDelay={0}
                             placement="right"
                             content={"Clocking into a sprint uses a default issue based on role you select."}>


                      <div className="property-row">
                        <div className="property-label">
                          Sprint
                        </div>
                        <div className="property-row">
                          <div className="property-value">
                            <SprintName sprint_id={sprint_id} />
                            <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockSprint)} />
                          </div>
                        </div>
                      </div>
                    </Floater>
                  </PropertyStackComponent>
                }

                { issue_id &&
                  <PropertyStackComponent>
                    <Floater title="Clock in issue"
                             disableHoverToClick
                             event="hover"
                             eventDelay={0}
                             placement="right"
                             content={"Clocks into this issue."}>


                      <div className="property-row">
                        <div className="property-label">
                          Issue
                        </div>
                        <div className="property-row">
                          <div className="property-value">
                            <IssueName issue_id={issue_id} />
                            <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockIssue)} />
                          </div>
                        </div>
                      </div>
                    </Floater>
                  </PropertyStackComponent>
                }

                { can_clock_admin &&
                  <PropertyStackComponent>
                    <Floater title="Clock in admin"
                             disableHoverToClick
                             event="hover"
                             eventDelay={0}
                             placement="right"
                             content={"Clocks into your default admin project, which is useful for cross project work which might not be billable."}>
                      <div className="property-row">
                        <div className="property-label">
                          General admin
                        </div>
                        <div className="property-row">
                          <div className="property-value">
                            <div className="icon--timer-start auto-clock__start" onClick={handleSubmit(this.clockAdmin)} />
                          </div>
                        </div>
                      </div>
                    </Floater>
                  </PropertyStackComponent>
                }
                  
              </PropertyStack>
                
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, project_id, sprint_id, issue_id } = props

    const project = getProject(state, project_id) || {}

    const role_options = map(project.logged_in_users_roles || [], function(role) { return ( {value: role, label: role} ) })
    const preferred_role = getPreferredRole()

    return {
        initialValues: {project_id: project_id,
                        sprint_id: sprint_id,
                        issue_id: issue_id,
                        role: preferred_role || project.logged_in_users_default_role},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        project_id,
        sprint_id,
        issue_id,
        project,
        can_clock_admin: true,
        role_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'auto_clock_new_entry_form'})(AutoClockNewEntryForm))
