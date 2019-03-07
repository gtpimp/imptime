import React, {Component} from 'react'
import {connect} from 'react-redux'
import BillableHoursStatementToolbarPanel from './BillableHoursStatementToolbarPanel'
import BulkCreateIssuesToolbarPanel from './BulkCreateIssuesToolbarPanel'
import BulkCreateFeaturesToolbarPanel from './BulkCreateFeaturesToolbarPanel'
import CalendarToolbarPanel from './CalendarToolbarPanel'
import ClockHistoryToolbarPanel from './ClockHistoryToolbarPanel'
import CompaniesToolbarPanel from './CompaniesToolbarPanel'
import DecisionJournalToolbarPanel from './DecisionJournalToolbarPanel'
import ProjectDashboardsToolbarPanel from './ProjectDashboardsToolbarPanel'
import ProjectDashboardToolbarPanel from './ProjectDashboardToolbarPanel'
import ProjectsToolbarPanel from './ProjectsToolbarPanel'
import ReleaseNotesToolbarPanel from './ReleaseNotesToolbarPanel'
import SprintDashboardToolbarPanel from './SprintDashboardToolbarPanel'
import SprintRateToolbarPanel from './SprintRateToolbarPanel'
import SprintsToolbarPanel from './SprintsToolbarPanel'
import SprintProposalToolbarPanel from './SprintProposalToolbarPanel'
import SprintReconToolbarPanel from './SprintReconToolbarPanel'
import ProjectReconToolbarPanel from './ProjectReconToolbarPanel'
import FeaturesToolbarPanel from './FeaturesToolbarPanel'
import FlatFeaturesToolbarPanel from './FlatFeaturesToolbarPanel'
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
import { cx, css } from 'react-emotion'
import { default_theme as theme } from '../../theme/default'
import { getPageName, getToolbarNames, getToolbarParams } from '../../actions/Page'

const ToolbarDiv = css`
display: flex;
justify-content: space-between;
height: 40px;
background-color: ${theme.colours.left_panel_background};
font-size: 15px;
width: 100%;
border-bottom: 1px solid #dcdcdc;
`

const left_toolbar = css`
display: flex;
flex: 2;
justify-content: flex-start;
align-items: center;
`

const right_toolbar = css`
display: flex;
flex: 8;
justify-content: flex-end;
align-items: center;
`

const menu_header = css`
font: ${theme.fonts.regular_large};
color: ${theme.colours.strong_text};
margin: 0;
padding: 0;
padding-left: 24px;
`

class Toolbar extends Component {
    
    renderPanel(id) {
        switch(id) {
            case 'company_problem':
                return <CompanyProblemToolbarPanel key='company_problem' {...this.props} />
            case 'companies':
                return <CompaniesToolbarPanel key='companies' {...this.props} />
            case 'features':
                return <FeaturesToolbarPanel key="features-panel" {...this.props}/>
            case 'flat-features':
                return <FlatFeaturesToolbarPanel key="flat-features-panel" {...this.props}/>
            case 'issue':
                return <IssueToolbarPanel key="issue-panel" {...this.props}/>
            case 'issues':
                return <IssuesToolbarPanel key="issues-panel" {...this.props}/>
            case 'list':
                return <ListToolbarPanel key="list-panel"{...this.props} />
            case 'project-dashboards':
                return <ProjectDashboardsToolbarPanel key="project-dashboards-toolbar-panel" {...this.props}/>
            case 'project-dashboard':
                return <ProjectDashboardToolbarPanel key="project-dashboard-panel"{...this.props} />
            case 'projects':
                return <ProjectsToolbarPanel key="projects-panel"{...this.props} />
            case 'sprint-dashboard':
                return <SprintDashboardToolbarPanel key="sprint-dashboard-panel"{...this.props} />
            case 'sprint-rate':
                return <SprintRateToolbarPanel key="sprint-rate-panel"{...this.props} />
            case 'sprints':
                return <SprintsToolbarPanel key="sprints-panel"{...this.props} />
            case 'sprint-proposal':
                return <SprintProposalToolbarPanel key="sprints-panel" {...this.props} />
            case 'sprint-recon':
                return <SprintReconToolbarPanel key="sprint-recon-panel" {...this.props} />
            case 'project-recon':
                return <ProjectReconToolbarPanel key="project-recon-panel" {...this.props} />
            case 'cost-summary':
                return <CostSummaryToolbarPanel key="cost-summary-panel" {...this.props}/>
            case 'project-statement':
                return <ProjectStatementToolbarPanel key="project-summary-panel" {...this.props}/>
            case 'billable-hours-statement':
                return <BillableHoursStatementToolbarPanel key="billable-hours-statement-panel" {...this.props}/>
            case 'user-timesheets':
                return <UserTimesheetsToolbarPanel key="user-timesheet-panel" {...this.props}/>
            case 'bulk-issue-creator':
                return <BulkCreateIssuesToolbarPanel key='bulk-issue-creator' {...this.props}/>
            case 'bulk-feature-creator':
                return <BulkCreateFeaturesToolbarPanel key='bulk-feature-creator' {...this.props}/>
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
                return <CalendarToolbarPanel key='calendar' {...this.props} />
            case 'clock-history':
                return <ClockHistoryToolbarPanel key='clock-history' {...this.props} />
            case 'decision-journals':
                return <DecisionJournalToolbarPanel key='decision-journals' {...this.props} />
            default:
                throw new Error("Unsupported toolbar panel:" + id)
        }
    }

    render() {
        const {panelIds, page_name} = this.props
        return (
            <div className={cx('main-layout__toolbar', ToolbarDiv)}>
              <div className={left_toolbar}>
                <p className={ menu_header }>{ page_name }</p>
              </div>
              <div side="right" className={right_toolbar}>
                {panelIds.map((panelId) => this.renderPanel(panelId))}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page_toolbars = getToolbarNames(state)
    const page_name = getPageName(state)
    const params = getToolbarParams(state)
    return {
        panelIds: page_toolbars,
        page_name,
        custom_props: params
    }
}


export default connect(mapStateToProps)(Toolbar)
