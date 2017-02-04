import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
// import PropertyStack from './PropertyStack'
// import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueTitle from '../components/EditableIssueTitle'
import EditableIssueDescription from '../components/EditableIssueDescription'
import EditableIssueAssignedUser from '../components/EditableIssueAssignedUser'
import EditableIssueComment from '../components/EditableIssueComment'
import EditableIssueAttachment from '../components/EditableIssueAttachment'
import EditableIssueInSprint from '../components/EditableIssueInSprint'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import OtherUser from '../components/OtherUser'
import {ensureIssuesLoaded, getIssues} from '../actions/Issues'

class MultipleIssueSidebar extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {issue_ids, dispatch} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureIssuesLoaded([new_props.issue_ids]))
    }
    
    render() {

        const {issues, issue_ids, project_id} = this.props
        
        return (

            <Sidebar>

                <div>
                    { issues.length } issues selected
                    
                    <div>
                        Sprint:
                        <EditableIssueInSprint issue_ids={issue_ids} />
                    </div>

                    <div>
                        Change assigned user:
                        <EditableIssueAssignedUser issue_ids={issue_ids} project_id={project_id} />
                    </div>
                </div>

            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue_ids, sprint_id, project_id} = props
    const issues = getIssues(state, issue_ids) || {}
    return {
        issues: issues || [],
        issue_ids: issue_ids,
        sprint_id: sprint_id,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(MultipleIssueSidebar)



