import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueTitle from './EditableIssueTitle'
import EditableIssueDescription from './EditableIssueDescription'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueComment from './EditableIssueComment'
import EditableIssueTestable from './EditableIssueTestable'
import EditableIssueAttachment from './EditableIssueAttachment'
import EditableIssueInSprint from './EditableIssueInSprint'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueVisualSpecDocument from './visual_spec/EditableIssueVisualSpecDocument'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import Sidebar from './Sidebar'
import {
    ensureIssuesLoaded,
    getIssue,
    populateEstimates
} from '../actions/Issues'
import { ensureUsersLoaded } from '../actions/Users'
import {format_hours} from '../actions/lib'
import {getProject} from '../actions/Projects'

    class IssueSidebar extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(props) {
        const {dispatch, issue_id, assignable_user_ids} = props
        dispatch(ensureIssuesLoaded([issue_id]))
        dispatch(ensureUsersLoaded(assignable_user_ids))
    }

    renderEstimates() {
        const {issue} = this.props
        return map(issue.all_estimates, function (estimate, index) {
            if (estimate.estimate_hours && estimate.estimate_user) {
                return (
                    <div key={estimate.estimate_user.id}>
                      {estimate.estimate_user.username}:{format_hours(estimate.estimate_hours)}
                    </div>
                )
            } else {
                return null
            }
        })
    }

    render() {

        const {issue, comments, testables, attachments, visual_spec_documents} = this.props

        if (issue && issue.id) {

            return (

                <Sidebar>
                  <PropertyStack>
                    { issue.id &&
                      <div>
                        <PropertyStackComponent>
                          <div className="text-component--readonly">
                            #{issue.number}
                          </div>
                        </PropertyStackComponent>

                        <PropertyStackComponent>
                          <EditableIssueTitle issue_id={issue.id}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Description">
                          <EditableIssueDescription issue_id={issue.id}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Testables">
                          { map(testables, function (testable, index) {
                                return <EditableIssueTestable key={issue.id, testable.id} issue_id={issue.id} testable_id={testable.id}/>
                            })
                          }
                          <EditableIssueTestable issue_id={issue.id} testable_id={null}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Assigned User">
                          <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Issue Status">
                          <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Sprint Name">
                          <EditableIssueInSprint issue_ids={[issue.id]}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Attachments">
                          { map(attachments, function (attachment, index) {
                                return <EditableIssueAttachment key={attachment.id} issue_id={issue.id} attachment_id={attachment.id}/>
                            })
                          }
                          <EditableIssueAttachment issue_id={issue.id} attachment_id={null}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Comments">
                          { map(comments, function (comment, index) {
                                return <EditableIssueComment key={issue.id, comment.id} issue_id={issue.id} comment_id={comment.id}/>
                            })
                          }
                          <EditableIssueComment issue_id={issue.id} comment_id={null}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent>
                          { this.renderEstimates() }
                          <button onClick={this.openEstimateEditor}>Estimates</button>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Visual Spec Documents">
                          { map(visual_spec_documents, function (visual_spec_document, index) {
                                return <EditableIssueVisualSpecDocument key={visual_spec_document.id}
                                                                        issue_id={issue.id}
                                                                        visual_spec_document_id={visual_spec_document.id}/>
                            })
                          }
                          <EditableIssueVisualSpecDocument issue_id={issue.id} visual_spec_document_id={null}/>
                        </PropertyStackComponent>

                        
                        
                      </div>
                    }
                  </PropertyStack>
                </Sidebar>
            )
        } else {
            return null
        }
    }
}

function mapStateToProps(state, props) {
    const {issue_id, sprint_id, project_id} = props
    const issue = getIssue(state, issue_id) || {}
    const project = getProject(state, project_id) || {}
    const assignable_user_ids = project.allowed_user_ids || []
    populateEstimates(state, issue)

    return {
        issue: issue || {},
        issue_id: issue_id,
        comments: issue.comments,
        testables: issue.testables,
        attachments: issue.attachments,
        visual_spec_documents: issue.visual_spec_documents,
        sprint_id: sprint_id,
        project_id: project_id,
        assignable_user_ids: assignable_user_ids,
    }
}

export default connect(mapStateToProps)(IssueSidebar)
