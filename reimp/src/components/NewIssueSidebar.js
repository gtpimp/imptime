import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateIssue,
    updateCandidateSubject,
    saveCandidateIssue
} from '../actions/Issues'
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

        return (
            <Sidebar>
                <PropertyStack>
                    <div>
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
    return {
        candidate_issue: candidate_issue
    }
}

export default connect(mapStateToProps)(NewIssueSidebar)
