import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
// import PropertyStack from './PropertyStack'
// import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueAssignedUser from '../components/EditableIssueAssignedUser'
import EditableIssueInSprint from '../components/EditableIssueInSprint'
import EditableIssueStatus from '../components/EditableIssueStatus'
import EditableIssueType from '../components/EditableIssueType'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import TagListFlat from './TagListFlat'
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

                <PropertyStackComponent>
                  <div>
                    Status:
                    <EditableIssueStatus issue_ids={issue_ids} project_id={project_id} />
                  </div>
                </PropertyStackComponent>
                
                <PropertyStackComponent>
                  <div>
                    Type:
                    <EditableIssueType issue_ids={issue_ids} project_id={project_id} />
                  </div>
                </PropertyStackComponent>

                
                <PropertyStackComponent>
                  <div>
                    Sprint:
                    <EditableIssueInSprint issue_ids={issue_ids} />
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div>
                    Change assigned user:
                    <EditableIssueAssignedUser issue_ids={issue_ids} project_id={project_id} />
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div>
                    Common tags:
                    <TagListFlat issue_ids={issue_ids}/>
                  </div>
                </PropertyStackComponent>

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



