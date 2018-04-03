import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {withRouter} from 'react-router-dom'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueTitle from './EditableIssueTitle'
import EditableIssueDescription from './EditableIssueDescription'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueComment from './EditableIssueComment'
import EditableIssueTestable from './EditableIssueTestable'
import TagListFlat from './TagListFlat'
import EditableIssueAttachment from './EditableIssueAttachment'
import EditableIssueInSprint from './EditableIssueInSprint'
import EditableIssueParent from './EditableIssueParent'
import EditableCopyIssueToSprint from './EditableCopyIssueToSprint'
import EditableMoveIssueToSprint from './EditableMoveIssueToSprint'
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
    makeFeatureIssuesSuccessive,
    deleteIssues
} from '../actions/Issues'
import { doesMienHaveFeature } from '../actions/Mien'

import { ensureUsersLoaded } from '../actions/Users'
import {format_hours} from '../actions/lib'
import {getProject} from '../actions/Projects'
import {getSprint} from '../actions/Sprints'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.toggleShowEmacsHints = this.toggleShowEmacsHints.bind(this)
        this.makeFeatureIssuesSuccessive = this.makeFeatureIssuesSuccessive.bind(this)
        this.closeIssueSidebar = this.closeIssueSidebar.bind(this)
        this.showIssueVisualSpecGallery = this.showIssueVisualSpecGallery.bind(this)
        this.onDelete = this.onDelete.bind(this)
        this.state = {emacs_hint_enabled: false}
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

    toggleShowEmacsHints() {
        this.setState({emacs_hint_enabled:!this.state.emacs_hint_enabled})
    }

    showIssueVisualSpecGallery() {
        const { issue, history } = this.props
        history.push('/projects/'+issue.project_id+'/sprints/'+issue.sprint_id+'/issues/'+issue.id+'/gallery/')
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

    onDelete(event) {
        const { issue, dispatch, onDelete } = this.props
        event.stopPropagation()
        if ( ! confirm( "Delete issue " + issue.number + " - " + issue.subject + "?") ) {
            return
        }
        dispatch(deleteIssues([issue.id]))
    }

    renderEmacsHintSection() {
        const {issue, sprint} = this.props
        const { emacs_hint_enabled } = this.state
        return (
            <div>
              <div className="issue_sidebar__emacs_copy_img" onClick={this.toggleShowEmacsHints} />

              { emacs_hint_enabled &&
                <div className="property-row">
                  <div className="property-label">
                    Emacs sprint
                  </div>
                  <div className="property-value">
                    <input value={"** sprint" + sprint.id + " " + sprint.name}/>
                  </div>
                </div>
              }
                { emacs_hint_enabled &&
                  <div className="property-row">
                    <div className="property-label">
                      Emacs issue
                    </div>
                    <div className="property-value">
                      <input value={"*** issue" + issue.number + " " + issue.subject}/>
                    </div>
                  </div>
                }
                  { emacs_hint_enabled &&
                    <div className="property-row">
                      <div className="property-label">
                        Git commit
                      </div>
                      <div className="property-value">
                        <input value={"#" + issue.number + " (sprint " + sprint.name + ") " + issue.subject}/>
                      </div>
                    </div>
                  }
            </div>
        )
    }

    render() {

        const {issue, comments, testables, attachments, visual_spec_documents,
               sprint, show_review_section, show_emacs_section, show_estimate_section} = this.props

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

                        <PropertyStackComponent>
                          <div className="property-row">
                            <div className="property-cell">
                              Created
                            </div>
                            <div className="property-cell">
                              <Timestamp value={issue.created_at} format="from_now" />
                            </div>
                            { issue.created_by_id &&
                              <div className="property-cell">by</div>
                            }
                            { issue.created_by_id &&
                              <div className="property-cell"><OtherUser user_id={issue.created_by_id} /></div>
                            }
                          </div>

                          { show_emacs_section && this.renderEmacsHintSection() }

                        </PropertyStackComponent>

                        <PropertyStackComponent>

                          <div className="property-row">
                            <div className="property-label">
                              Sprint
                            </div>
                            <div className="property-value">
                              <div className="property-row">
                                <div className="property-value">
                                  <EditableIssueInSprint issue_ids={[issue.id]}/>
                                </div>
                                <div className="property-col-small">
                                  <EditableMoveIssueToSprint issue_ids={[issue.id]} />
                                </div>
                                <div className="property-col-small">
                                  <EditableCopyIssueToSprint issue_ids={[issue.id]} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="property-row">
                            <div className="property-label">
                              Parent feature
                            </div>
                            <div className="property-value">
                              <EditableIssueParent issue_ids={[issue.id]}/>
                            </div>
                          </div>

                          <div className="property-row">
                            <div className="property-label">
                              Type
                            </div>
                            <div className="property-value">
                              <EditableIssueType issue_ids={[issue.id]} project_id={issue.project_id}/>
                            </div>
                          </div>

                          <div className="property-row">
                            <div className="property-label">
                              Status
                            </div>
                            <div className="property-value">
                              <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
                            </div>
                          </div>

                          <div className="property-row">
                            <div className="property-label">
                              Assigned user
                            </div>
                            <div className="property-value">
                              <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
                            </div>
                          </div>

                          <div className="property-row">
                            <div className="property-label">
                              Tags
                            </div>
                            <div className="property-value">
                              <TagListFlat issue_ids={[issue.id]}/>
                            </div>
                          </div>

                        </PropertyStackComponent>

                        <PropertyStackComponent title="Context">
                          <EditableIssueDescription issue_id={issue.id}/>
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

                        { show_estimate_section && 
                          <PropertyStackComponent title="Estimates">
                            <div>
                              <EditableIssueEstimate issue_id={issue.id} />
                            </div>
                            <IssueEstimatesSummary issue_id={issue.id} />
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

                        { show_review_section && 
                          <PropertyStackComponent title="Reviews">
                            <IssueReviewPanel issue_id={issue.id} />
                          </PropertyStackComponent>
                        }

                        { issue.id && <PropertyStackComponent>
                          <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>
                            delete issue
                          </button>
                        </PropertyStackComponent> }

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
    const show_review_section = doesMienHaveFeature(state, 'review_schedule')
    const show_emacs_section = doesMienHaveFeature(state, 'emacs')
    const show_estimate_section = doesMienHaveFeature(state, 'sidebar_issue_estimates')
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
        assignable_user_ids,
        show_review_section,
        show_emacs_section,
        show_estimate_section
    }
}

export default withRouter(connect(mapStateToProps)(IssueSidebar))
