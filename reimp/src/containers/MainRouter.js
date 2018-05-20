import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
/* import {withRouter} from 'react-router' */
import AccountCreatePage from './AccountCreatePage'
import AccountCreatedPage from './AccountCreatedPage'
import BulkIssueCreatorPage from './BulkIssueCreatorPage'
import ChangePasswordPage from './ChangePasswordPage'
import PasswordChangedPage from './PasswordChangedPage'
import DashboardPage from './DashboardPage'
import DevPage from './DevPage'
import ForgotPasswordPage from './ForgotPasswordPage'
import IssuesPage from './IssuesPage'
import InvoicesPage from './InvoicesPage'
import PasswordReminderSentPage from './PasswordReminderSentPage'
import ProjectDashboardPage from './ProjectDashboardPage'
import ProjectStatementPage from './ProjectStatementPage'
import ProjectUserPage from './ProjectUserPage'
import ProjectsPage from './ProjectsPage'
import SprintCostSummaryPage from './SprintCostSummaryPage'
import SprintDashboardPage from './SprintDashboardPage'
import SprintRatePage from './SprintRatePage'
import UserTimesheetPage from './UserTimesheetPage'
import NudgePage from './NudgePage'
import SchedulesPage from './SchedulesPage'
import ScheduleItemPage from './ScheduleItemPage'
import WorkSummaryPage from './WorkSummaryPage'
import ProjectRoadmapPage from './ProjectRoadmapPage'
import ProjectWikiPage from './ProjectWikiPage'
import ReadOnlyPage from './ReadOnlyPage'
import ReleaseNotesPage from './ReleaseNotesPage'
import SprintsPage from './SprintsPage'
import VisualSpecDocumentPage from '../components/visual_spec/VisualSpecDocumentPage'

class MainRouter extends Component {

    render() {
        return (
            <Switch>
              <Route exact path="/" component={NudgePage}/>
              <Route exact path="/account/create" component={AccountCreatePage}/>
              <Route exact path="/account/created" component={AccountCreatedPage}/>
              <Route exact path="/work_summary" component={WorkSummaryPage}/>
              <Route exact path="/nudge" component={NudgePage}/>
              <Route exact path="/schedule" component={SchedulesPage}/>
              <Route exact path="/schedule/:scheduleId" component={ScheduleItemPage}/>
              <Route exact path="/password/changed" component={PasswordChangedPage}/>
              <Route exact path="/password/change" component={ChangePasswordPage}/>
              <Route exact path="/password/forgot" component={ForgotPasswordPage}/>
              <Route exact path="/password/reminded" component={PasswordReminderSentPage}/>
              <Route exact path="/dev" component={DevPage}/>
              <Route exact path="/release_notes_editor" component={ReleaseNotesPage}/>
              <Route exact path="/invoices" component={InvoicesPage}/>
              <Route exact path="/projects" component={ProjectsPage}/>
              <Route exact path="/projects/:projectId" component={ProjectsPage}/>
              <Route exact path="/projects/:projectId/dashboard" component={ProjectDashboardPage}/>
              <Route exact path="/projects/:projectId/projectStatement" component={ProjectStatementPage}/>
              <Route exact path="/projects/:projectId/sprints" component={SprintsPage}/>
              <Route exact path="/projects/:projectId/roadmap" component={ProjectRoadmapPage}/>
              <Route exact path="/projects/:projectId/gallery/" component={VisualSpecDocumentPage}/>
              <Route exact path="/projects/:projectId/gallery/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route exact path="/projects/:projectId/wiki/" component={ProjectWikiPage}/>
              <Route exact path="/projects/:projectId/wiki/:wikiId" component={ProjectWikiPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId" component={SprintsPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/dashboard" component={SprintDashboardPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/rates" component={SprintRatePage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues" component={IssuesPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues/:issueId" component={IssuesPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues/:issueId/gallery" component={VisualSpecDocumentPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues/:issueId/gallery/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues/:issueId/visualSpec/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/costSummary" component={SprintCostSummaryPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/bulkCreate" component={BulkIssueCreatorPage}/>
              <Route exact path="/projects/:projectId/users" component={ProjectUserPage}/>
              <Route exact path="/projects/:projectId/users/:userId/:viewMode" component={ProjectUserPage}/>
              <Route exact path="/visualSpec/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route exact path="/share/:type/:obj_ref" component={ReadOnlyPage}/>
              <Route exact path="/share/:type/:obj_ref/:subref" component={ReadOnlyPage}/>
              <Route exact path="/dashboard" component={DashboardPage}/>
              <Route exact path="/usertimesheets" component={UserTimesheetPage}/>
            </Switch>
        )
    }
    
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(MainRouter))
