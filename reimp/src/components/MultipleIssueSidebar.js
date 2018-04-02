import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import map from 'lodash/map'
import {withRouter} from 'react-router-dom'
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
import MultipleIssueSummary from './MultipleIssueSummary'
import moment from 'moment'
import Sidebar from './Sidebar'
import TagListFlat from './TagListFlat'
import {
    ensureIssuesLoaded,
    getIssues,
    deleteIssues
} from '../actions/Issues'
import { doesMienHaveFeature } from '../actions/Mien'

class MultipleIssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
    }

    componentDidMount() {
        const {issue_ids, dispatch} = this.props
        dispatch(ensureIssuesLoaded(issue_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureIssuesLoaded(new_props.issue_ids))
    }

    onDelete(event) {
        const { issue_ids, dispatch, onDelete } = this.props
        event.stopPropagation()
        if ( ! confirm( "Delete these issues?") ) {
            return
        }
        dispatch(deleteIssues(issue_ids))
    }

    render() {

        const {issues, issue_ids, project_id, show_summary} = this.props

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

                <PropertyStackComponent>
                  <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>
                    delete issues
                  </button>
                </PropertyStackComponent>

                { show_summary &&
                  <PropertyStackComponent>
                    <MultipleIssueSummary filter={{issue_ids:issue_ids}} project_id={project_id} />
                  </PropertyStackComponent>
                }
                
              </PropertyStack>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue_ids, sprint_id, project_id} = props
    const issues = getIssues(state, issue_ids) || {}
    const show_summary = doesMienHaveFeature(state, 'multiple_issue_summary')
    return {
        issues: issues || [],
        issue_ids: issue_ids,
        sprint_id: sprint_id,
        project_id: project_id,
        show_summary
    }
}

export default connect(mapStateToProps)(MultipleIssueSidebar)
