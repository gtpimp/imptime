import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStackComponent from './PropertyStackComponent'
import MienFeature from './MienFeature'
import EditableIssueAssignedUser from '../components/EditableIssueAssignedUser'
import EditableIssueInSprint from '../components/EditableIssueInSprint'
import EditableIssueStatus from '../components/EditableIssueStatus'
import EditableIssueType from '../components/EditableIssueType'
import EditableIssueParent from './EditableIssueParent'
import EditableCopyIssueToSprint from './EditableCopyIssueToSprint'
import MultipleIssueSummary from './MultipleIssueSummary'
import EditableIssueRisky from './EditableIssueRisky'
import TagListFlat from './TagListFlat'
import {
    ensureIssuesLoaded,
    getIssues,
    deleteIssues
} from '../actions/Issues'

import SidebarContainer from './SidebarContainer'
import SidebarProperty from './SidebarProperty'
import SidebarDetail from './SidebarDetail'
import SidebarSectionTitle from './SidebarSectionTitle'

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
        const { issue_ids, dispatch } = this.props
        event.stopPropagation()
        if ( ! window.confirm( "Delete these issues?") ) {
            return
        }
        dispatch(deleteIssues(issue_ids))
    }

    renderInfoStack() {
        const {issue_ids, project_id} = this.props
        return (
            <SidebarProperty key="infostack">
              <SidebarDetail label="Sprint">
                <EditableIssueInSprint issue_ids={issue_ids}/>
                <EditableCopyIssueToSprint issue_ids={issue_ids} />
                {/* <div className="property-row">
                    <div className="property-value">
                    
                    </div>
                    <div className="property-col-small">
                    <EditableMoveIssueToSprint issue_ids={issue_ids} />
                    </div>
                    <div className="property-col-small">
                    <EditableCopyIssueToSprint issue_ids={issue_ids} />
                    </div>
                    </div> */}
              </SidebarDetail>

              <SidebarDetail label="Parent Feature">
                <EditableIssueParent issue_ids={issue_ids}/>
              </SidebarDetail>

              <SidebarDetail label="Type">
                <EditableIssueType issue_ids={issue_ids} project_id={project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Status">
                <EditableIssueStatus issue_ids={issue_ids} project_id={project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Assigned to">
                <EditableIssueAssignedUser issue_ids={issue_ids} project_id={project_id}/>
              </SidebarDetail>

              <SidebarDetail label="Risky">
                <EditableIssueRisky issue_ids={issue_ids} project_id={project_id}/>
              </SidebarDetail>
            </SidebarProperty>
        )
    }

    renderIssueCount = () => {
        const {issues} = this.props
        return (
            <SidebarProperty key="issuecountstack">
              <SidebarSectionTitle title={`${issues.length} issues selected`} />
            </SidebarProperty>
        )
    }

    renderTagStack = () => {
        const {issue_ids} = this.props
        return (
            <SidebarProperty key="tagstack">
              <SidebarSectionTitle title="Common tags" />
              <TagListFlat issue_ids={issue_ids}/>
            </SidebarProperty>
        )
    }

    renderButtons = () => {
        const {issue_ids, project_id} = this.props
        return (
            <div>
              <PropertyStackComponent>
                <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>
                  delete issues
                </button>
              </PropertyStackComponent>
              
              <MienFeature feature_name="multiple_issue_summary">
                <PropertyStackComponent>
                  <MultipleIssueSummary filter={{issue_ids:issue_ids}} project_id={project_id} auto_load={false} />
                </PropertyStackComponent>
              </MienFeature>
            </div>
        )
    }

    render() {
        return (
            <SidebarContainer>
              {
                  [
                      this.renderIssueCount(),
                      this.renderInfoStack(),
                      this.renderTagStack(),
                      this.renderButtons()
                  ]
              }
            </SidebarContainer>
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
