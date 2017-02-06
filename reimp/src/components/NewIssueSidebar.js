import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueTitle from '../components/EditableIssueTitle'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {
    getCandidateIssue,
    updateCandidateSubject,
    cancelCandidateIssue,
    saveCandidateIssue
} from '../actions/Issue'
import IssueTitleForm from './form/IssueTitleForm'

class NewIssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
    }

    onSaveCandidateIssue(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateSubject(new_value.title))
        dispatch(saveCandidateIssue())
    }

    render() {

        const {issue, comments, attachments} = this.props

        return (
            <Sidebar>
                <PropertyStack>
                    <div>
                        <div>
                            <IssueTitleForm onChange={this.onSaveCandidateIssue}/>
                        </div>
                    </div>
                </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_issue = getCandidateIssue(state) || null
    return {
        candidate_issue: candidate_issue
    }
}

export default connect(mapStateToProps)(NewIssueSidebar)
