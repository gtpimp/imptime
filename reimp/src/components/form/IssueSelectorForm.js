import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Field} from 'redux-form'
import { reduxForm } from 'redux-form';
import '../../sass/text-component.scss'
import IssueSelectorField from './IssueSelectorField'
import SprintSelectorField from './SprintSelectorField'
import ProjectSelectorField from './ProjectSelectorField'
import IssueTitleField from './IssueTitleField'
import IssueAssigneeField from './IssueAssigneeField'
import { getGloballySelectedEntityIds } from '../../actions/Page'
import {
    startCandidateIssue,
    updateCandidateSubject,
    updateCandidateProperties,
    saveCandidateIssue
} from '../../actions/Issues'
import PopupPanelMiniButton from '../PopupPanelMiniButton'
import SidebarContainer from '../SidebarContainer'
import SidebarProperty from '../SidebarProperty'
import SidebarDetail from '../SidebarDetail'

class IssueSelectorForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeProject = this.onChangeProject.bind(this)
        this.onChangeSprint = this.onChangeSprint.bind(this)
        this.onChangeIssue = this.onChangeIssue.bind(this)
        this.handleSubmitIntercept = this.handleSubmitIntercept.bind(this)
        this.onStartCreateNewIssue = this.onStartCreateNewIssue.bind(this)
        this.onStopCreateNewIssue = this.onStopCreateNewIssue.bind(this)
        this.state = { project_id: null,
                       sprint_id: null,
                       issue_id: null,
                       creating_issue: false}
    }

    componentDidMount() {
        const { default_project_id, default_sprint_id, default_issue_id, initial_mode } = this.props
        this.setState( {project_id: default_project_id,
                        sprint_id: default_sprint_id,
                        issue_id: default_issue_id,
                        creating_issue: initial_mode === "create"} )
    }

    onChangeProject(new_project_id) {
        this.setState({project_id:new_project_id})
    }

    onChangeSprint(new_sprint_id) {
        this.setState({sprint_id:new_sprint_id})
    }

    onChangeIssue(new_issue_id) {
        this.setState({issue_id:new_issue_id})
    }

    onStartCreateNewIssue() {
        this.setState({creating_issue:true})
    }

    onStopCreateNewIssue() {
        this.setState({creating_issue:false})
    }

    handleSubmitIntercept(values) {
        const { dispatch, onSubmitted, optional_default_issue_values } = this.props

        if ( values.issue_title ) {
            dispatch(startCandidateIssue(values.sprint_id))
            dispatch(updateCandidateSubject(values.issue_title))
            if ( values.assigned_user ) {
                dispatch(updateCandidateProperties({assigned_to_id:values.assigned_user}))
            }
            if ( values.due_now ) {
                dispatch(updateCandidateProperties({due_now:values.due_now}))
            }
            if ( optional_default_issue_values ) {
                dispatch(updateCandidateProperties(optional_default_issue_values))
            }
            const onDone = function(issue_id) {
                onSubmitted({issue_id: issue_id,
                             sprint_id: values.sprint_id,
                             project_id: values.project_id})
            }
            dispatch(saveCandidateIssue(onDone))
        } else {
            onSubmitted({issue_id: values.issue_id,
                         sprint_id: values.sprint_id,
                         project_id: values.project_id})
        }
    }

    renderCreateNewIssue() {
        const { project_id } = this.state
        return (
            <div>
              
              <SidebarDetail label="Title">
                <IssueTitleField />
              </SidebarDetail>

              <SidebarDetail label="Assignee (optional)">
                <IssueAssigneeField project_id={project_id} />
              </SidebarDetail>

              <SidebarDetail label="Due date (optional)">
                <label>Due today<Field component="input" type="checkbox" name="due_now" /></label>
              </SidebarDetail>
              
            </div>
        )
    }

    render() {
        const { handleSubmit, default_project_id } = this.props
        const { project_id, sprint_id, creating_issue } = this.state

        return (
            <form onSubmit={handleSubmit(this.handleSubmitIntercept)}>
              <div>

                <SidebarContainer>
                  <SidebarProperty key="infostack">
                    <SidebarDetail label="Project">
                      <ProjectSelectorField auto_focus={false}
                                            onChange={this.onChangeProject}
                                            default_project_id={project_id || default_project_id} />
                    </SidebarDetail>

                    { project_id && 
                      <SidebarDetail label="Sprint">
                        <SprintSelectorField project_id={project_id}
                                             auto_focus={false}
                                             onChange={this.onChangeSprint}
                        />
                      </SidebarDetail>
                    }

                    { sprint_id &&
                      <div>
                        { creating_issue && this.renderCreateNewIssue() }
                        { ! creating_issue &&
                          <SidebarDetail label="Issue">
                            <div>
                              <IssueSelectorField sprint_id={sprint_id}
                                                  auto_focus={false}
                                                  onChange={this.onChangeIssue} />
                              <PopupPanelMiniButton onClick={this.onStartCreateNewIssue}>
                                New issue
                              </PopupPanelMiniButton>
                            </div>
                          </SidebarDetail>
                        }
                      </div>
                    }
                  </SidebarProperty>
                  { sprint_id && 
                    <button className="button issue_sidebar--textarea" type="submit">Submit</button>
                  }
                </SidebarContainer>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, optional_default_issue_values, initial_mode} = props

    const entityIdsAvailableForEventCreation = getGloballySelectedEntityIds(state)
    const { project_id, sprint_id } = entityIdsAvailableForEventCreation || {}
    
    return {
        initialValues: Object.assign({},
                                     {issue_title:'',
                                      project_id: project_id,
                                      sprint_id: sprint_id},
                                     optional_default_issue_values),
        enableReinitialize: true,
        onSubmitted,
        default_project_id: project_id,
        default_sprint_id: sprint_id,
        optional_default_issue_values,
        initial_mode: initial_mode || "search"
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_selector_form'})(IssueSelectorForm))
