import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
// import PropertyStack from './PropertyStack'
// import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueAssignedUser from '../components/EditableIssueAssignedUser'
import EditableIssueInSprint from '../components/EditableIssueInSprint'
import EditableIssueStatus from '../components/EditableIssueStatus'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {ensureIssuesLoaded, getIssues} from '../actions/Issue'

class MultipleIssueSidebar extends Component {

    componentDidMount() {
        const {issue_ids, dispatch} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureIssuesLoaded(new_props.issue_ids))
    }
    
    render() {

        const {issues, issue_ids, project_id} = this.props
        
        return (

            <Sidebar>

                <div>
                    { issues.length } issues selected
                    
                    <div>
                        Status:
                        <EditableIssueStatus issue_ids={issue_ids} project_id={project_id} />
                    </div>

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



