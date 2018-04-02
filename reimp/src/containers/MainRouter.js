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
              <Route path="/account/create" component={AccountCreatePage}/>
              <Route path="/account/created" component={AccountCreatedPage}/>
              <Route path="/work_summary" component={WorkSummaryPage}/>
              <Route path="/nudge" component={NudgePage}/>
              <Route path="/password/changed" component={PasswordChangedPage}/>
              <Route path="/password/change" component={ChangePasswordPage}/>
              <Route path="/password/forgot" component={ForgotPasswordPage}/>
              <Route path="/password/reminded" component={PasswordReminderSentPage}/>
              <Route path="dev" component={DevPage}/>
              <Route path="release_notes_editor" component={ReleaseNotesPage}/>
              <Route path="invoices" component={InvoicesPage}/>
              <Route path="projects" component={ProjectsPage}/>
              <Route path="projects/:projectId" component={ProjectsPage}/>
              <Route path="projects/:projectId/dashboard" component={ProjectDashboardPage}/>
              <Route path="projects/:projectId/projectStatement" component={ProjectStatementPage}/>
              <Route path="projects/:projectId/sprints" component={SprintsPage}/>
              <Route path="projects/:projectId/roadmap" component={ProjectRoadmapPage}/>
              <Route path="projects/:projectId/gallery/" component={VisualSpecDocumentPage}/>
              <Route path="projects/:projectId/gallery/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route path="projects/:projectId/wiki/" component={ProjectWikiPage}/>
              <Route path="projects/:projectId/wiki/:wikiId" component={ProjectWikiPage}/>
              <Route path="projects/:projectId/sprints/:sprintId" component={SprintsPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/dashboard" component={SprintDashboardPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/rates" component={SprintRatePage}/>
              <Route path="projects/:projectId/sprints/:sprintId/issues" component={IssuesPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/issues/:issueId" component={IssuesPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/issues/:issueId/gallery" component={VisualSpecDocumentPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/issues/:issueId/gallery/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/issues/:issueId/visualSpec/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/costSummary" component={SprintCostSummaryPage}/>
              <Route path="projects/:projectId/sprints/:sprintId/bulkCreate" component={BulkIssueCreatorPage}/>
              <Route path="projects/:projectId/users" component={ProjectUserPage}/>
              <Route path="projects/:projectId/users/:userId/:viewMode" component={ProjectUserPage}/>
              <Route path="visualSpec/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>

              <Route path="share/:type/:obj_ref" component={ReadOnlyPage}/>
              <Route path="share/:type/:obj_ref/:subref" component={ReadOnlyPage}/>

              <Route path="dashboard" component={DashboardPage}/>
              <Route path="usertimesheets" component={UserTimesheetPage}/>
            </div>
        )
    }
    
}

export default MainRouter
