import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateIssue,
    updateCandidateSubject,
    updateCandidateSprint,
    updateCandidateProperties,
    cancelCandidateIssue,
    saveCandidateIssue
} from '../actions/Issues'
import NewIssueForm from './form/NewIssueForm'

class NewIssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
        this.keyDown = this.keyDown.bind(this)
    }

    keyDown(event) {
        const { dispatch } = this.props
        if (event.keyCode === 27) {
            event.preventDefault()
            dispatch(cancelCandidateIssue())
        }
    }

    onSaveCandidateIssue(new_value) {
        const {onCreatedIssues, dispatch} = this.props
        dispatch(updateCandidateSubject(new_value.issue_title))
        dispatch(updateCandidateSprint(new_value.sprint_id))
        dispatch(updateCandidateProperties(new_value))
        const onDone = function(issue_id) {
            onCreatedIssues([issue_id], new_value.sprint_id, new_value.project_id)
        }
        dispatch(saveCandidateIssue(onDone))
    }

    render() {

        const { project_id, sprint_id, default_issue_values } = this.props
        
        return (
            <Sidebar>
              <PropertyStack>
                <div onKeyDown={this.keyDown}>
                  <div>
                    <NewIssueForm onSubmitted={this.onSaveCandidateIssue}
                                  default_project_id={project_id}
                                  default_sprint_id={sprint_id}
                                  optional_default_issue_values={default_issue_values}/>
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, sprint_id, onCreatedIssues, default_issue_values } = props

    const candidate_issue = getCandidateIssue(state) || null
    return {
        candidate_issue: candidate_issue,
        project_id,
        sprint_id,
        default_issue_values,
        onCreatedIssues
    }
}

export default connect(mapStateToProps)(NewIssueSidebar)
