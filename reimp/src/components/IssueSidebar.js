import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {withRouter} from 'react-router-dom'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import EditableIssueTitle from './EditableIssueTitle'
import EditableIssueDescription from './EditableIssueDescription'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueRisky from './EditableIssueRisky'
import EditableIssueComment from './EditableIssueComment'
import EditableIssueTestable from './EditableIssueTestable'
import MienFeature from './MienFeature'
import TagListFlat from './TagListFlat'
//import EditableIssueAttachment from './EditableIssueAttachment'
import EditableIssueInSprint from './EditableIssueInSprint'
import EditableIssueParent from './EditableIssueParent'
import EditableCopyIssueToSprint from './EditableCopyIssueToSprint'
import EditableMoveIssueToSprint from './EditableMoveIssueToSprint'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueType from './EditableIssueType'
//import EditableIssueVisualSpecDocument from './visual_spec/EditableIssueVisualSpecDocument'
import EditableIssueEstimate from './EditableIssueEstimate'
import IssueReviewPanel from './IssueReviewPanel'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import VisualSpecDocumentForm from './visual_spec/VisualSpecDocumentForm'
import IssueEstimatesSummary from './IssueEstimatesSummary'

import SidebarContainer from './SidebarContainer'
import SidebarProperty from './SidebarProperty'
import SidebarSectionTitle from './SidebarSectionTitle'
import SidebarTitle from './SidebarTitle'
import SidebarFullscreenWidget from './SidebarFullscreenWidget'
import SidebarAuthor from './SidebarAuthor'
import SidebarDetail from './SidebarDetail'

import OtherUser from './OtherUser'
// import IssueDescription from './IssueDescription'
import Timestamp from './Timestamp'
//import moment from 'moment'
import {
    ensureIssuesLoaded,
    getIssue,
    populateEstimates,
    makeFeatureIssuesSuccessive
} from '../actions/Issues'

import { ensureUsersLoaded } from '../actions/Users'
import {getProject} from '../actions/Projects'
import {getSprint} from '../actions/Sprints'
import IssueDependancies from './IssueDependancies'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.toggleShowEmacsHints = this.toggleShowEmacsHints.bind(this)
        this.makeFeatureIssuesSuccessive = this.makeFeatureIssuesSuccessive.bind(this)
        this.showIssueVisualSpecGallery = this.showIssueVisualSpecGallery.bind(this)
        this.onFullscreen = this.onFullscreen.bind(this)
        this.onExitFullscreen = this.onExitFullscreen.bind(this)
        this.showAddVisualSpecDoc = this.showAddVisualSpecDoc.bind(this)
        this.hideAddVisualSpecDoc = this.hideAddVisualSpecDoc.bind(this)
        this.state = {emacs_hint_enabled: false,
                      adding_visual_spec_doc: false}
    }

    componentDidMount() {
        this.refresh(this.props)
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    toggleShowEmacsHints() {
        this.setState({emacs_hint_enabled:!this.state.emacs_hint_enabled})
    }

    showIssueVisualSpecGallery() {
        const { issue, history } = this.props
        history.push('/projects/'+issue.project_id+'/sprints/'+issue.sprint_id+'/issues/'+issue.id+'/gallery/')
    }

    showAddVisualSpecDoc() {
        this.setState({adding_visual_spec_doc:true})
    }

    hideAddVisualSpecDoc() {
        this.setState({adding_visual_spec_doc:false})
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

    onFullscreen() {
        const { setSidebarViewMode } = this.props
        setSidebarViewMode("fullscreen")
    }

    onExitFullscreen() {
        const { setSidebarViewMode } = this.props
        setSidebarViewMode("right")
    }
    
    renderEmacsHintStack() {
        const {issue, sprint} = this.props
        const { emacs_hint_enabled } = this.state
        return (
            <SidebarProperty key="emacshintstack">
              <MienFeature feature_name="emacs">
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
              </MienFeature>
            </SidebarProperty>
        )
    }

    renderIssueNumberStack() {
        const { issue } = this.props
        return (
            <SidebarProperty key="issuenumberstack">
              <SidebarSectionTitle title={`Issue #${issue.number}`} />
            </SidebarProperty>
        )
    }

    renderTitleStack() {
        const { issue, full_screen_mode_available, sidebar_view_mode } = this.props
        return (
            <SidebarProperty key="titlestack">
              <SidebarTitle issue_id={ issue.id }>
                <SidebarFullscreenWidget
                    sidebar_view_mode={ sidebar_view_mode }
                    full_screen_mode_available={ full_screen_mode_available }
                    onExitFullscreen={ this.onExitFullscreen }
                    onFullscreen={ this.onFullscreen } />
              </SidebarTitle>
            </SidebarProperty>
        )
    }

    renderCreationStack() {
        const { issue } = this.props
        return (
            <SidebarProperty key="issuenumberstack">
              <SidebarAuthor issue_id={ issue.id } />
            </SidebarProperty>
        )
    }

    renderInfoStack() {
        const { issue } = this.props
        return (
            <SidebarProperty key="infostack">
              <SidebarDetail label="Sprint">
                <EditableIssueInSprint issue_ids={[issue.id]}/>
                {/* <div className="property-row">
                    <div className="property-value">
                    
                    </div>
                    <div className="property-col-small">
                    <EditableMoveIssueToSprint issue_ids={[issue.id]} />
                    </div>
                    <div className="property-col-small">
                    <EditableCopyIssueToSprint issue_ids={[issue.id]} />
                    </div>
                    </div> */}
              </SidebarDetail>

              <SidebarDetail label="Parent Feature">
                <EditableIssueParent issue_ids={[issue.id]}/>
              </SidebarDetail>

              <SidebarDetail label="Type">
                <EditableIssueType issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Status">
                <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Assigned to">
                <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Risky">
                <EditableIssueRisky issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>
            </SidebarProperty>
        )
        
    }

    renderTagStack() {
        const { issue } = this.props
        return (
            <SidebarProperty key="tagstack">
              <SidebarSectionTitle title="Tags" />
              <TagListFlat issue_ids={[issue.id]}/>
            </SidebarProperty>
        )
    }

    renderDependancyStack() {
        const { issue } = this.props
        return (
            <div key="dependancystack">
              <SidebarSectionTitle title="Dependancies" />
              <PropertyStackComponent>
                <IssueDependancies issue_id={issue.id} />
              </PropertyStackComponent>
            </div>
        )
    }

    renderDescriptionStack() {
        const { issue } = this.props
        return (
            <div key="descriptionstack">
              <SidebarSectionTitle title="Description" />
              <EditableIssueDescription issue_id={issue.id}/>
            </div>
        )
    }

    renderTestablesStack() {
        const { issue, testables } = this.props
        return (
            <div key="testablestack">
              <SidebarSectionTitle title="Testables" />
              { map(testables, function (testable, index) {
                    return <EditableIssueTestable key={issue.id+"_"+testable.id} issue_id={issue.id} testable_id={testable.id}/>
                })
              }
              <EditableIssueTestable issue_id={issue.id} testable_id={null}/>
            </div>
        )
    }

    renderCommentsStack() {
        const { issue, comments } = this.props
        return (
            <PropertyStackComponent key="commentsstack">
              <SidebarSectionTitle title="Comments" />
              { map(comments, function (comment, index) {
                    return <EditableIssueComment key={issue.id+"_"+comment.id} issue_id={issue.id} comment_id={comment.id}/>
                })
              }
              <EditableIssueComment issue_id={issue.id} comment_id={null}/>
            </PropertyStackComponent>
        )
    }

    renderEstimatesStack() {
        const { issue } = this.props
        return (
            <MienFeature key="estimatesstack" feature_name="issue_estimates">
              <SidebarSectionTitle title="Estimates" />
              <PropertyStackComponent>
                <div>
                  <EditableIssueEstimate issue_id={issue.id} />
                </div>
                <IssueEstimatesSummary issue_id={issue.id} />
              </PropertyStackComponent>
            </MienFeature>
        )
    }

    renderAddAttachmentWidget() {
        const { issue } = this.props
        return (
            <PropertyStackComponent>
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery visual_spec_document_ids={issue.visual_spec_document_ids}
                                         issue_id={issue.id}
                                         allow_edit={false} />
              <button className="button button--primary" onClick={this.showAddVisualSpecDoc}>Add</button>
              <button className="button button--secondary" onClick={this.showIssueVisualSpecGallery}>Manage</button>
            </PropertyStackComponent>
        )
    }

    renderAttachmentsStack() {
        const { issue, project_id } = this.props
        const adding_visual_spec_doc = this.state.adding_visual_spec_doc
        return (
            <PropertyStackComponent key="attachmentstack">
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery visual_spec_document_ids={issue.visual_spec_document_ids}
                                         issue_id={issue.id}
                                         allow_edit={false} />
              
              { ! adding_visual_spec_doc && (
                    <div className="property-row">
                      <div onClick={this.showAddVisualSpecDoc} className="icon--add icon--clickable" data-tooltip="Upload attachment"></div>
                      <button className="button button--secondary" onClick={this.showIssueVisualSpecGallery}>Manage</button>
                    </div>
              )}
              { adding_visual_spec_doc && (
                    <div>
                      <VisualSpecDocumentForm issue_id={issue.id}
                                              project_id={project_id}
                                              onChange={this.hideAddVisualSpecDoc}
                      />
                      <button className="button button--primary" onClick={this.hideAddVisualSpecDoc}>Cancel</button>
                    </div>
              )}
            </PropertyStackComponent>
        )
    }

    renderFeatureStack() {
        const { issue } = this.props
        if ( ! issue.can_group_issues ) {
            return null
        }
        return (
            <PropertyStackComponent key="featurestack" title="Feature">
              <div>
                Bring this feature's issues
                <button className="button button--primary sprint_sidebar--button" onClick={this.makeFeatureIssuesSuccessive}>
                  together
                </button>
              </div>
            </PropertyStackComponent>
        )
    }

    renderReviewsStack() {
        const { issue } = this.props
        return (
            <MienFeature key="reviewstack" feature_name="issue_reviews">
              <PropertyStackComponent>
                <SidebarSectionTitle title="Reviews" />
                <IssueReviewPanel issue_id={issue.id} />
              </PropertyStackComponent>
            </MienFeature>
        )
    }

    renderNarrow() {
        const {issue, header_height, footer_height, toolbar_height } = this.props

        if (issue && issue.id) {
            return (
                <SidebarContainer>
                  { issue.id && 
                    [
                        this.renderIssueNumberStack(),
                        this.renderTitleStack(),
                        this.renderCreationStack(),
                        this.renderEmacsHintStack(),
                        this.renderInfoStack(),
                        this.renderTagStack(),
                        this.renderDescriptionStack(),
                        this.renderTestablesStack()
                    ]
                  }
                  {/* { issue.id && 
                      [
                      this.renderIssueNumberStack(),
                      this.renderTitleStack(),
                      this.renderCreationStack(),
                      this.renderInfoStack(),
                      this.renderTagStack(),
                      this.renderDescriptionStack(),
                      this.renderTestablesStack(),
                      this.renderCommentsStack(),
                      this.renderEstimatesStack(),
                      this.renderDependancyStack(),
                      this.renderAttachmentsStack(),
                      this.renderFeatureStack(),
                      this.renderReviewsStack()
                      ]
                      } */}
                </SidebarContainer>
            )
        } else {
            return null
        }        
    }

    renderWide() {
        const {issue, header_height, footer_height, toolbar_height } = this.props
        const height_limit = "calc(100vh - " + (header_height + footer_height + toolbar_height + 1) +"px)"
        const styles={maxHeight: height_limit}

        if (issue && issue.id) {

            return (

                <div className="sidebar sidebar--wide issue-sidebar" style={styles}>
                  <PropertyStack>
                    { issue.id &&
                      <div>
                        <div className="sidebar__title--wide">
                          { this.renderTitleStack() }
                        </div>
                        <div className="sidebar__fullscreen__cols_container">
                          <div className="sidebar__fullscreen__col">
                            { this.renderDescriptionStack() }
                            { this.renderTestablesStack() }
                            { this.renderCommentsStack() }
                          </div>
                          <div>
                            { this.renderCreationStack() }
                            { this.renderInfoStack() }
                            { this.renderEstimatesStack() }
                            { this.renderAttachmentsStack() }
                            { this.renderFeatureStack() }
                          </div>
                        </div>
                      </div>
                    }
                  </PropertyStack>
                </div>
            )
        } else {
            return null
        }        
    }

    render() {
        const { sidebar_view_mode } = this.props
        if ( sidebar_view_mode === 'right' ) {
            return this.renderNarrow()
        } else if ( sidebar_view_mode === 'fullscreen' ) {
            return this.renderWide()
        } else {
            return (<div>Dev error: No view mode specified</div>)
        }
    }
}

function mapStateToProps(state, props) {
    const {issue_id, sprint_id, project_id, sidebar_view_mode, setSidebarViewMode} = props
    const issue = getIssue(state, issue_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const assignable_user_ids = project.allowed_user_ids || []
    populateEstimates(state, issue)

    return {
        full_screen_mode_available: setSidebarViewMode || false,
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
        setSidebarViewMode,
        sidebar_view_mode
    }
}

export default withRouter(connect(mapStateToProps)(IssueSidebar))
