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
import EditableIssueType from './EditableIssueType'
import EditableIssueVisualSpecDocument from './visual_spec/EditableIssueVisualSpecDocument'
import EditableIssueEstimate from './EditableIssueEstimate'
import IssueReviewPanel from './IssueReviewPanel'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import IssueEstimatesSummary from './IssueEstimatesSummary'
import OtherUser from './OtherUser'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
import moment from 'moment'
import {
    ensureIssuesLoaded,
    getIssue,
    populateEstimates,
    makeFeatureIssuesSuccessive
} from '../actions/Issues'
import { ensureUsersLoaded } from '../actions/Users'
import {format_hours} from '../actions/lib'
import {getProject} from '../actions/Projects'
import {getSprint} from '../actions/Sprints'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.showEmacsIssue = this.showEmacsIssue.bind(this)
        this.showEmacsSprint = this.showEmacsSprint.bind(this)
        this.showGitCommitMessage = this.showGitCommitMessage.bind(this)
        this.makeFeatureIssuesSuccessive = this.makeFeatureIssuesSuccessive.bind(this)
        this.closeIssueSidebar = this.closeIssueSidebar.bind(this)
        this.showIssueVisualSpecGallery = this.showIssueVisualSpecGallery.bind(this)
    }

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    closeIssueSidebar() {
        const { dispatch } = this.props
        
    }

    showEmacsIssue() {
        const { issue } = this.props
        const text = "*** issue" + issue.number + " " + issue.subject
        window.prompt("Press Ctrl+C then Enter, then paste into emacs:", text);
    }

    showEmacsSprint() {
        const { issue, sprint } = this.props
        const text = "** sprint#" + sprint.id + " " + sprint.name
        window.prompt("Press Ctrl+C then Enter, then paste into emacs:", text);
    }

    showGitCommitMessage() {
        const { issue, sprint } = this.props
        const text = "#" + issue.number + " (sprint " + sprint.name + ") " + issue.subject
        window.prompt("Press Ctrl+C then Enter, then paste into emacs:", text);
    }
    
    showIssueVisualSpecGallery() {
        const { issue } = this.props
        browserHistory.push('/projects/'+issue.project_id+'/sprints/'+issue.sprint_id+'/issues/'+issue.id+'/gallery/')
    }

    makeFeatureIssuesSuccessive() {
        const { dispatch, issue_id, sprint_id } = this.props
        dispatch(makeFeatureIssuesSuccessive(issue_id, sprint_id))
    }

    refresh(props) {
        const {dispatch, issue_id, assignable_user_ids} = props
        dispatch(ensureIssuesLoaded([issue_id]))
        dispatch(ensureUsersLoaded(assignable_user_ids))
    }

    render() {

        const {issue, comments, testables, attachments, visual_spec_documents} = this.props

        if (issue && issue.id) {

            return (

                <div className="sidebar issue-sidebar">
                  <PropertyStack>
                    { issue.id &&
                      <div>
                        <PropertyStackComponent>
                          <div className="issue_sidebar__title">
                            <div className="text-component--readonly issue_sidebar__title_number">
                              #{issue.number}
                            </div>
                            <EditableIssueTitle issue_id={issue.id}/>
                          </div>
                          <div className="issue_sidebar__close" onClick={this.closeIssueSidebar}>
                          </div>
                          
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Description">
                          <EditableIssueDescription issue_id={issue.id}/>
                        </PropertyStackComponent>
                        
                        <PropertyStackComponent>
                          <div>
                            Created <Timestamp value={issue.created_at} format="from_now" />
                            { issue.created_by_id &&
                              <div>by <OtherUser user_id={issue.created_by_id} /></div>
                            }
                          </div>
                          <div onClick={this.showEmacsIssue}>
                            Issue
                            <div className="issue_sidebar__emacs_copy_img" />
                          </div>
                          <div onClick={this.showEmacsSprint}>
                            Sprint
                            <div className="issue_sidebar__emacs_copy_img" />
                          </div>
                          <div onClick={this.showGitCommitMessage}>
                            Git commit message
                            <div className="issue_sidebar__git_img" />
                          </div>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Testables">
                          { map(testables, function (testable, index) {
                                return <EditableIssueTestable key={issue.id, testable.id} issue_id={issue.id} testable_id={testable.id}/>
                            })
                          }
                          <EditableIssueTestable issue_id={issue.id} testable_id={null}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Comments">
                          { map(comments, function (comment, index) {
                                return <EditableIssueComment key={issue.id, comment.id} issue_id={issue.id} comment_id={comment.id}/>
                            })
                          }
                          <EditableIssueComment issue_id={issue.id} comment_id={null}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Assigned User">
                          <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Issue Status">
                          <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Issue Type">
                          <EditableIssueType issue_ids={[issue.id]} project_id={issue.project_id}/>
                        </PropertyStackComponent>
                        
                        <PropertyStackComponent title="Estimates">
                          <div>
                            <EditableIssueEstimate issue_id={issue.id} />
                          </div>
                          <IssueEstimatesSummary issue_id={issue.id} />
                        </PropertyStackComponent>

                        <PropertyStackComponent title="Sprint Name">
                          <EditableIssueInSprint issue_ids={[issue.id]}/>
                        </PropertyStackComponent>

                        { false &&
                          <PropertyStackComponent title="Attachments">
                            { map(attachments, function (attachment, index) {
                                  return <EditableIssueAttachment key={attachment.id} issue_id={issue.id} attachment_id={attachment.id}/>
                              })
                            }
                            <EditableIssueAttachment issue_id={issue.id} attachment_id={null}/>
                          </PropertyStackComponent>
                        }

                        <PropertyStackComponent title="Attachments">
                          <VisualSpecDocumentGallery visual_spec_document_ids={issue.visual_spec_document_ids}
                                                     issue_id={issue.id}
                                                     allow_edit={false} />
                          <button className="button button--primary" onClick={this.showIssueVisualSpecGallery}>Manage</button>
                        </PropertyStackComponent>

                        { issue.can_group_issues &&
                          <PropertyStackComponent title="Feature">
                            Bring this feature's issues
                            <button className="button button--primary sprint_sidebar--button" onClick={this.makeFeatureIssuesSuccessive}>
                              together
                            </button>
                          </PropertyStackComponent>
                        }
                        
                        <PropertyStackComponent title="Reviews">
                          <IssueReviewPanel issue_id={issue.id} />
                        </PropertyStackComponent>

                      </div>
                    }
                  </PropertyStack>
                </div>
            )
        } else {
            return null
        }
    }
}

function mapStateToProps(state, props) {
    const {issue_id, sprint_id, project_id} = props
    const issue = getIssue(state, issue_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
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
        sprint,
        assignable_user_ids: assignable_user_ids,
    }
}

export default connect(mapStateToProps)(IssueSidebar)
