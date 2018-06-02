import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateIssue,
    updateCandidateSubject,
    updateCandidateSprint,
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
        dispatch(updateCandidateSubject(new_value.title))
        dispatch(updateCandidateSprint(new_value.sprint_id))
        
        const onDone = function(issue_id) {
            onCreatedIssues([issue_id])
        }
        dispatch(saveCandidateIssue(onDone))
    }

    render() {

        const { project_id, sprint_id } = this.props
        
        return (
            <Sidebar>
              <PropertyStack>
                <div onKeyDown={this.keyDown}>
                  <div>
                    <NewIssueForm onSubmitted={this.onSaveCandidateIssue}
                                  default_project_id={project_id}
                                  default_sprint_id={sprint_id} />
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const { onSelectIssues, project_id, sprint_id } = props

    const candidate_issue = getCandidateIssue(state) || null
    return {
        candidate_issue: candidate_issue,
        onSelectIssues,
        project_id,
        sprint_id
    }
}

export default connect(mapStateToProps)(NewIssueSidebar)
