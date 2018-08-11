import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form';
import '../../sass/text-component.scss'
import IssueSelectorField from './IssueSelectorField'
import SprintSelectorField from './SprintSelectorField'
import ProjectSelectorField from './ProjectSelectorField'
import IssueTitleField from './IssueTitleField';
import PropertyStackComponent from '../PropertyStackComponent'
import { getGloballySelectedEntityIds } from '../../actions/Page'
import {
    startCandidateIssue,
    updateCandidateSubject,
    updateCandidateProperties,
    saveCandidateIssue
} from '../../actions/Issues'

class IssueSelectorForm extends Component {

    constructor(props) {
        super(props)
        this.state = { project_id: null,
                       sprint_id: null,
                       issue_id: null }
        this.onChangeProject = this.onChangeProject.bind(this)
        this.onChangeSprint = this.onChangeSprint.bind(this)
        this.onChangeIssue = this.onChangeIssue.bind(this)
        this.handleSubmitIntercept = this.handleSubmitIntercept.bind(this)
    }

    componentDidMount() {
        const { default_project_id, default_sprint_id, default_issue_id } = this.props
        this.setState( {project_id: default_project_id,
                        sprint_id: default_sprint_id,
                        issue_id: default_issue_id} )
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

    handleSubmitIntercept(values) {
        const { dispatch, onSubmitted, optional_default_issue_values } = this.props

        if ( values.issue_title ) {
            dispatch(startCandidateIssue(values.sprint_id))
            dispatch(updateCandidateSubject(values.issue_title))
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

    render() {
        const { handleSubmit, default_project_id } = this.props
        const { project_id, sprint_id } = this.state

        return (
            <form onSubmit={handleSubmit(this.handleSubmitIntercept)}>
              <div>

                <div className="issue_sidebar--textarea">
                  <PropertyStackComponent title="Project">
                    <ProjectSelectorField auto_focus={false}
                                          onChange={this.onChangeProject}
                                          default_project_id={project_id || default_project_id} />
                  </PropertyStackComponent>
                  
                  { project_id &&
                    <PropertyStackComponent title="Sprint">
                      <SprintSelectorField project_id={project_id}
                                           auto_focus={false}
                                           onChange={this.onChangeSprint}
                      />
                    </PropertyStackComponent>
                  }
                  { sprint_id &&
                    <PropertyStackComponent title="Issue">
                      Create a new issue or select an issue:
                      <IssueTitleField />
                      <IssueSelectorField sprint_id={sprint_id}
                                          auto_focus={false}
                                          onChange={this.onChangeIssue} />
                    </PropertyStackComponent>
                  }
                </div>
                <button className="button issue_sidebar--textarea" type="submit">Submit</button>
              </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmitted, optional_default_issue_values} = props

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
        optional_default_issue_values
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_selector_form'})(IssueSelectorForm))
