import React, {Component} from 'react'
import {connect} from 'react-redux'
import BillableHoursStatementToolbarPanel from './BillableHoursStatementToolbarPanel'
import BulkCreateIssuesToolbarPanel from './BulkCreateIssuesToolbarPanel'
import CalendarToolbarPanel from './CalendarToolbarPanel'
import ProjectDashboardsToolbarPanel from './ProjectDashboardsToolbarPanel'
import ProjectDashboardToolbarPanel from './ProjectDashboardToolbarPanel'
import ProjectsToolbarPanel from './ProjectsToolbarPanel'
import ReleaseNotesToolbarPanel from './ReleaseNotesToolbarPanel'
import SprintDashboardToolbarPanel from './SprintDashboardToolbarPanel'
import SprintRateToolbarPanel from './SprintRateToolbarPanel'
import SprintsToolbarPanel from './SprintsToolbarPanel'
import NudgeToolbarPanel from './NudgeToolbarPanel'
import CompanyProblemToolbarPanel from './CompanyProblemToolbarPanel'
import ScheduleToolbarPanel from './ScheduleToolbarPanel'
import ScheduleItemToolbarPanel from './ScheduleItemToolbarPanel'
import WorkSummaryToolbarPanel from './WorkSummaryToolbarPanel'
import IssueToolbarPanel from './IssueToolbarPanel'
import IssuesToolbarPanel from './IssuesToolbarPanel'
import ListToolbarPanel from './ListToolbarPanel'
import CostSummaryToolbarPanel from './CostSummaryToolbarPanel'
import ProjectStatementToolbarPanel from './ProjectStatementToolbarPanel'
import ProjectRoadmapToolbarPanel from './ProjectRoadmapToolbarPanel'
import ProjectWikiToolbarPanel from './ProjectWikiToolbarPanel'
import UserTimesheetsToolbarPanel from './UserTimesheetsToolbarPanel'
import VisualSpecDocumentToolbarPanel from '../visual_spec/VisualSpecDocumentToolbarPanel'
import styled from 'react-emotion'
import { default_theme as theme } from '../../theme/default'

const ToolbarDiv = styled('div')(props => ({display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            height: "36px",
                                            color: theme.colours.strong_text,
                                            backgroundColor: theme.colours.left_panel_background,
                                            fontSize: "15px",
                                            width: "100%"}))

const ToolbarSideDiv = styled('div')(props => ({alignItems: "center",
                                                display: "flex",
                                                flexGrow: "1",
                                                justifyContent: props.side === 'left' ?  'flex-start' : 'flex-end'}))

class Toolbar extends Component {
    
    renderPanel(id) {
        switch(id) {
            case 'company_problem':
                return <CompanyProblemToolbarPanel key='company_problem' {...this.props} />
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
            case 'sprint-rate':
                return <SprintRateToolbarPanel key="sprint-rate-panel"/>
            case 'sprints':
                return <SprintsToolbarPanel key="sprints-panel"/>
            case 'cost-summary':
                return <CostSummaryToolbarPanel key="cost-summary-panel" {...this.props}/>
            case 'project-statement':
                return <ProjectStatementToolbarPanel key="project-summary-panel" {...this.props}/>
            case 'billable-hours-statement':
                return <BillableHoursStatementToolbarPanel key="billable-hours-statement-panel" {...this.props}/>
            case 'user-timesheets':
                return <UserTimesheetsToolbarPanel key="user-timesheet-panel" {...this.props}/>
            case 'visual-spec-document':
                return <VisualSpecDocumentToolbarPanel key='visual-spec-document' {...this.props}/>
            case 'bulk-issue-creator':
                return <BulkCreateIssuesToolbarPanel key='bulk-issue-creator' {...this.props}/>
            case 'release-notes':
                return <ReleaseNotesToolbarPanel key='release-notes' {...this.props}/>
            case 'project-roadmap':
                return <ProjectRoadmapToolbarPanel key='project-roadmap' {...this.props} />
            case 'nudge':
                return <NudgeToolbarPanel key='nudge' {...this.props} />
            case 'schedule':
                return <ScheduleToolbarPanel key='schedule' {...this.props} />
            case 'schedule_item':
                return <ScheduleItemToolbarPanel key='schedule_item' {...this.props} />
            case 'project-wiki':
                return <ProjectWikiToolbarPanel key='project-wiki' {...this.props} />
            case 'work-summary':
                return <WorkSummaryToolbarPanel key='summary' {...this.props} />
            case 'calendar':
                return <CalendarToolbarPanel key='summary' {...this.props} />
            default:
                throw new Error("Unsupported toolbar panel:" + id)
        }
    }

    render() {
        const {panelIds} = this.props
        return (
            <ToolbarDiv>
              <ToolbarSideDiv side="right">
                {panelIds.map((panelId) => this.renderPanel(panelId))}
              </ToolbarSideDiv>
            </ToolbarDiv>
        )
    }
}

function mapStateToProps(state, props) {
    const page_toolbars = state.page.toolbar_names || []

    return {
        panelIds: page_toolbars
    }
}


export default connect(mapStateToProps)(Toolbar)
