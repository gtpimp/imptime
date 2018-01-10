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
import EditableCopyIssueToSprint from './EditableCopyIssueToSprint'
import EditableIssueStatus from '../components/EditableIssueStatus'
import EditableIssueType from '../components/EditableIssueType'
import EditableIssueParent from './EditableIssueParent'
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

            <div className="sidebar issue-sidebar">

              <PropertyStack>

                <PropertyStackComponent>
                  { issues.length } issues selected
                </PropertyStackComponent>

                <PropertyStackComponent>

                  <div className="property-row">
                    <div className="property-label">
                      Sprint
                    </div>
                    <div className="property-value">
                      <div className="property-row">
                        <div className="property-value">
                          <EditableIssueInSprint issue_ids={issue_ids} />
                        </div>
                        <div className="property-col">
                          <EditableCopyIssueToSprint issue_ids={issue_ids} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="property-row">
                    <div className="property-label">
                      Parent feature
                    </div>
                    <div className="property-value">
                      <EditableIssueParent issue_ids={issue_ids}/>
                    </div>
                  </div>
                  
                  <div className="property-row">
                    <div className="property-label">
                      Type
                    </div>
                    <div className="property-value">
                      <EditableIssueType issue_ids={issue_ids} project_id={project_id} />
                    </div>
                  </div>

                  <div className="property-row">
                    <div className="property-label">
                      Status
                    </div>
                    <div className="property-value">
                      <EditableIssueStatus issue_ids={issue_ids} project_id={project_id} />
                    </div>
                  </div>

                  <div className="property-row">
                    <div className="property-label">
                      Assigned user
                    </div>
                    <div className="property-value">
                      <EditableIssueAssignedUser issue_ids={issue_ids} project_id={project_id} />
                    </div>
                  </div>
                  
                </PropertyStackComponent>
                
                <PropertyStackComponent>
                  <div>
                    Common tags:
                    <TagListFlat issue_ids={issue_ids}/>
                  </div>
                </PropertyStackComponent>

              </PropertyStack>
            </div>
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



