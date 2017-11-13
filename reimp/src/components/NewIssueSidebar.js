import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateIssue,
    updateCandidateSubject,
    cancelCandidateIssue,
    saveCandidateIssue
} from '../actions/Issues'
import IssueTitleForm from './form/IssueTitleForm'

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

        const onDone = function(issue_id) {
            onCreatedIssues([issue_id])
        }
        dispatch(saveCandidateIssue(onDone))
    }

    render() {

        return (
            <Sidebar>
              <PropertyStack>
                <div onKeyDown={this.keyDown}>
                  <div>
                    <IssueTitleForm onSubmitted={this.onSaveCandidateIssue}/>
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_issue = getCandidateIssue(state) || null
    const { onSelectIssues } = props
    return {
        candidate_issue: candidate_issue,
        onSelectIssues
    }
}

export default connect(mapStateToProps)(NewIssueSidebar)
