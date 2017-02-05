import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableIssueAssignedUser from '../components/EditableIssueAssignedUser'
import EditableIssueInSprint from '../components/EditableIssueInSprint'
import Sidebar from './Sidebar'
import {ensureIssuesLoaded, getIssues} from '../actions/Issues'

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



