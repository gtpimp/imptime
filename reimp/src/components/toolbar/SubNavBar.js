import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar.css'
import Breadcrumbs from '../../components/Breadcrumbs'
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
import glamorous from 'glamorous'
import { default_theme as theme } from '../../glamorous/theme'

const SubNavBarDiv = glamorous.div({display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: "36px",
                                    color: theme.colours.strong_text,
                                    marginLeft: "12px",
                                    fontSize: "15px",
                                    width: "100%"})

class SubNavBar extends Component {
    
render() {
        const {panelIds} = this.props
        return (
            <SubNavBarDiv>
              <div className="toolbar__container toolbar__container--left">
                <Breadcrumbs />
              </div>
            </SubNavBarDiv>
        )
    }
}

function mapStateToProps(state, props) {
    const page_toolbars = state.page.toolbar_names || []

    return {
        panelIds: page_toolbars
    }
}


export default connect(mapStateToProps)(SubNavBar)
