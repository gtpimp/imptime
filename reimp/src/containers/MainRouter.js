import React, {Component, PropTypes} from 'react'
import { Route } from 'react-router-dom'
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
            <div>
              <Route path="/" exact component={NudgePage}/>
              <Route path="/account/create" exact component={AccountCreatePage}/>
              <Route path="/account/created" exact component={AccountCreatedPage}/>
              <Route path="/work_summary" exact component={WorkSummaryPage}/>
              <Route path="/nudge" exact component={NudgePage}/>
              <Route path="/password/changed" exact component={PasswordChangedPage}/>
              <Route path="/password/change" exact component={ChangePasswordPage}/>
              <Route path="/password/forgot" exact component={ForgotPasswordPage}/>
              <Route path="/password/reminded" exact component={PasswordReminderSentPage}/>
              <Route path="/dev" exact component={DevPage}/>
              <Route path="/release_notes_editor" exact component={ReleaseNotesPage}/>
              <Route path="/invoices" exact component={InvoicesPage}/>
              <Route path="/projects" exact component={ProjectsPage}/>
              <Route path="/projects/:projectId" exact component={ProjectsPage}/>
              <Route path="/projects/:projectId/dashboard" exact component={ProjectDashboardPage}/>
              <Route path="/projects/:projectId/projectStatement" exact component={ProjectStatementPage}/>
              <Route path="/projects/:projectId/sprints" exact component={SprintsPage}/>
              <Route path="/projects/:projectId/roadmap" exact component={ProjectRoadmapPage}/>
              <Route path="/projects/:projectId/gallery/" exact component={VisualSpecDocumentPage}/>
              <Route path="/projects/:projectId/gallery/:visualSpecDocumentId" exact component={VisualSpecDocumentPage}/>
              <Route path="/projects/:projectId/wiki/" exact component={ProjectWikiPage}/>
              <Route path="/projects/:projectId/wiki/:wikiId" exact component={ProjectWikiPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId" exact component={SprintsPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/dashboard" exact component={SprintDashboardPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/rates" exact component={SprintRatePage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/issues" exact component={IssuesPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/issues/:issueId" exact component={IssuesPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/issues/:issueId/gallery" exact component={VisualSpecDocumentPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/issues/:issueId/gallery/:visualSpecDocumentId" exact component={VisualSpecDocumentPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/issues/:issueId/visualSpec/:visualSpecDocumentId" exact component={VisualSpecDocumentPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/costSummary" exact component={SprintCostSummaryPage}/>
              <Route path="/projects/:projectId/sprints/:sprintId/bulkCreate" exact component={BulkIssueCreatorPage}/>
              <Route path="/projects/:projectId/users" exact component={ProjectUserPage}/>
              <Route path="/projects/:projectId/users/:userId/:viewMode" exact component={ProjectUserPage}/>
              <Route path="/visualSpec/:visualSpecDocumentId" exact component={VisualSpecDocumentPage}/>
              <Route path="/share/:type/:obj_ref" exact component={ReadOnlyPage}/>
              <Route path="/share/:type/:obj_ref/:subref" exact component={ReadOnlyPage}/>
              <Route path="/dashboard" exact component={DashboardPage}/>
              <Route path="/usertimesheets" exact component={UserTimesheetPage}/>
            </div>
        )
    }
    
}

export default MainRouter
