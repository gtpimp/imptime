import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar.css'
import Breadcrumbs from '../../components/Breadcrumbs'
import BulkCreateIssuesToolbarPanel from './BulkCreateIssuesToolbarPanel'
import ProjectDashboardsToolbarPanel from './ProjectDashboardsToolbarPanel'
import ProjectDashboardToolbarPanel from './ProjectDashboardToolbarPanel'
import ProjectsToolbarPanel from './ProjectsToolbarPanel'
import SprintDashboardToolbarPanel from './SprintDashboardToolbarPanel'
import SprintsToolbarPanel from './SprintsToolbarPanel'
import SprintTemplatesToolbarPanel from './SprintTemplatesToolbarPanel'
import IssueToolbarPanel from './IssueToolbarPanel'
import IssuesToolbarPanel from './IssuesToolbarPanel'
import ListToolbarPanel from './ListToolbarPanel'
import CostSummaryToolbarPanel from './CostSummaryToolbarPanel'
import ProjectStatementToolbarPanel from './ProjectStatementToolbarPanel'
import UserTimesheetsToolbarPanel from './UserTimesheetsToolbarPanel'
import VisualSpecDocumentToolbarPanel from '../visual_spec/VisualSpecDocumentToolbarPanel'

class ToolBar extends Component {

    renderPanel(id) {
        switch(id) {
            case 'issue':
                return <IssueToolbarPanel key="issue-panel"/>
            case 'issues':
                return <IssuesToolbarPanel key="issues-panel"/>
            case 'list':
                return <ListToolbarPanel key="list-panel"/>
            case 'project-dashboards':
                return <ProjectDashboardsToolbarPanel key="project-dashboards-toolbar-panel" {...this.props}/>
            case 'project-dashboard':
                return <ProjectDashboardToolbarPanel key="project-dashboard-panel"/>
            case 'projects':
                return <ProjectsToolbarPanel key="projects-panel"/>
            case 'sprint-dashboard':
                return <SprintDashboardToolbarPanel key="sprint-dashboard-panel"/>
            case 'sprints':
                return <SprintsToolbarPanel key="sprints-panel"/>
            case 'sprint-templates':
                return <SprintTemplatesToolbarPanel key="sprint-templates-panel"/>
            case 'cost-summary':
                return <CostSummaryToolbarPanel key="cost-summary-panel" {...this.props}/>
            case 'project-statement':
                return <ProjectStatementToolbarPanel key="project-summary-panel" {...this.props}/>
            case 'user-timesheets':
                return <UserTimesheetsToolbarPanel key="user-timesheet-panel" {...this.props}/>
            case 'visual-spec-document':
                return <VisualSpecDocumentToolbarPanel key='visual-spec-document' {...this.props}/>
            case 'bulk-issue-creator':
                return <BulkCreateIssuesToolbarPanel key='bulk-issue-creator' {...this.props}/>
            default:
                throw new Error("Unsupported toolbar panel:" + id)
        }
    }

    render() {
        const {breadcrumbs, panelIds} = this.props
        return (
            <div className="toolbar">
                <div className="toolbar__container toolbar__container--left">
                    <Breadcrumbs />
                </div>
                <div className="toolbar__container toolbar__container--right">
                    {panelIds.map((panelId) => this.renderPanel(panelId))}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page_toolbars = state.page.toolbar_names || []

    return {
        panelIds: page_toolbars
    }
}


export default connect(mapStateToProps)(ToolBar)
