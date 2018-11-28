import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, size } from 'lodash'
import {withRouter} from 'react-router-dom'
import Floater from "react-floater"
import PropertyStack from './PropertyStack'
import EditableIssueDescription from './EditableIssueDescription'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueDueDate from './EditableIssueDueDate'
import EditableIssueRisky from './EditableIssueRisky'
import EditableIssueComment from './EditableIssueComment'
import EditableIssueTestable from './EditableIssueTestable'
import EditableCopyIssueToSprint from './EditableCopyIssueToSprint'
import MienFeature from './MienFeature'
import TagListFlat from './TagListFlat'
import EditableIssueInSprint from './EditableIssueInSprint'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueType from './EditableIssueType'
import EditableIssueEstimate from './EditableIssueEstimate'
import EditableIssueFeature from './EditableIssueFeature'
import IssueReviewPanel from './IssueReviewPanel'
import VisualSpecDocumentGallery from './visual_spec/VisualSpecDocumentGallery'
import VisualSpecDocumentForm from './visual_spec/VisualSpecDocumentForm'
import IssueEstimatesSummary from './IssueEstimatesSummary'
import EditableIssueTitle from './EditableIssueTitle'

import SidebarContainer from './SidebarContainer'
import SidebarProperty from './SidebarProperty'
import SidebarSectionTitle from './SidebarSectionTitle'
import SidebarTitle from './SidebarTitle'
import SidebarFullscreenWidget from './SidebarFullscreenWidget'
import SidebarAuthor from './SidebarAuthor'
import SidebarDetail from './SidebarDetail'
import SidebarAddButton from './SidebarAddButton'

// import IssueDescription from './IssueDescription'
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

    renderIssueNumberStack = () => {
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
              <SidebarTitle variant="issue" variant_id={ issue.id }>
                <EditableIssueTitle issue_id={issue.id} />
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
            <SidebarProperty key="creationstack">
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
                <EditableCopyIssueToSprint issue_ids={[issue.id]} />
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

              <SidebarDetail label="Type">
                <EditableIssueType issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Status">
                <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Assigned to">
                <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Due date">
                <EditableIssueDueDate issue_ids={[issue.id]} project_id={issue.project_id}/>
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
              <IssueDependancies issue_id={issue.id} />
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
            <div key="commentsstack">
              <SidebarSectionTitle title="Comments" />
              { map(comments, function (comment, index) {
                    return <EditableIssueComment key={issue.id+"_"+comment.id} issue_id={issue.id} comment_id={comment.id}/>
                })
              }
              <EditableIssueComment issue_id={issue.id} comment_id={null}/>
            </div>
        )
    }

    renderFeaturesStack() {
        const { issue_id, feature_testables, testables } = this.props
        return (
            <div key="featuresstack">
              <Floater key={`feature_testable_hint_${issue_id}`}
                       title={<div>Features implemented</div>}
                       disableHoverToClick
                       event="hover"
                       eventDelay={0}
                       placement="bottom"
                       content={
                           <div>A list of features which this issue either partly or completely implements</div>
                       }
              >
                <SidebarSectionTitle title="Features implemented" />
              </Floater>
              { map(feature_testables, function (feature_testable, index) {
                    const feature_id = feature_testable.feature_ids[0]
                    return (
                        <div key={`issue_feature_${issue_id}_${feature_id}_${feature_testable.id}`}>
                          <EditableIssueFeature key={`editable_issue_feature_${issue_id}_${feature_id}_${feature_testable.id}`}
                                                issue_id={issue_id}
                                                feature_id={feature_id}
                                                feature_testable_id={feature_testable.id} />
                        </div>
                    )
                })
              }
              <div>
                { size(testables) === 0 &&
                  <div>Add a testable to this issue before linking to a feature</div>
                }
                { size(testables) > 0 &&
                  <EditableIssueFeature key={`issue_feature_${issue_id}_new`}
                                        issue_id={issue_id}
                                        feature_id={null}
                                        feature_testable_id={null} />
                }
              </div>
            </div>
        )
    }

    renderEstimatesStack() {
        const { issue } = this.props
        return (
            <MienFeature key="estimatesstack" feature_name="issue_estimates">
              <SidebarProperty key="estimatesstackproperty">
                <SidebarSectionTitle title="Estimates" />
                <EditableIssueEstimate issue_id={issue.id} />
                <IssueEstimatesSummary issue_id={issue.id} />
              </SidebarProperty>
            </MienFeature>
        )
    }

    renderAttachmentsStack() {
        const { issue, project_id } = this.props
        const adding_visual_spec_doc = this.state.adding_visual_spec_doc
        return (
            <SidebarProperty key="attachmentstack">
              <SidebarSectionTitle title="Attachments" />
              <VisualSpecDocumentGallery annotated_visual_spec_document_ids={issue.annotated_visual_spec_document_ids}
                                         issue_id={issue.id}
                                         allow_edit={false} />
              
              { ! adding_visual_spec_doc && (
                    <SidebarAddButton
                        data-tooltip="Upload attachment"
                        onButtonClick={this.showAddVisualSpecDoc}
                        label="Add attachment" />
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
            </SidebarProperty>
        )
    }

    renderReviewsStack() {
        const { issue } = this.props
        return (
            <MienFeature key="reviewstack" feature_name="issue_reviews">
              <SidebarProperty key="featurestack">
                <SidebarSectionTitle title="Reviews" />
                <IssueReviewPanel issue_id={issue.id} />
              </SidebarProperty>
            </MienFeature>
        )
    }

    renderNarrow() {
        const {issue} = this.props

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
                        this.renderTestablesStack(),
                        this.renderCommentsStack(),
                        this.renderFeaturesStack(),
                        this.renderEstimatesStack(),
                        this.renderDependancyStack(),
                        this.renderAttachmentsStack(),
                        this.renderReviewsStack()
                    ]
                  }
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
        feature_testables: issue.feature_testables,
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
