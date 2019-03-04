import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
/* import {withRouter} from 'react-router' */
import AccountCreatePage from './AccountCreatePage'
import AccountCreatedPage from './AccountCreatedPage'
import BillableHoursStatementPage from './BillableHoursStatementPage'
import BulkIssueCreatorPage from './BulkIssueCreatorPage'
import BulkFeatureCreatorPage from './BulkFeatureCreatorPage'
import CalendarPage from './CalendarPage'
import ChangePasswordPage from './ChangePasswordPage'
import CompaniesPage from './CompaniesPage'
import CompanyUserPage from './CompanyUserPage'
import ClockHistoryPage from './ClockHistoryPage'
import CompanyProblemPage from './CompanyProblemPage'
import DecisionJournalPage from './DecisionJournalPage'
import PasswordChangedPage from './PasswordChangedPage'
import DashboardPage from './DashboardPage'
import ForgotPasswordPage from './ForgotPasswordPage'
import IssuesPage from './IssuesPage'
import IssueHistoryPage from './IssueHistoryPage'
import InvoicesPage from './InvoicesPage'
import PasswordReminderSentPage from './PasswordReminderSentPage'
import ProjectDashboardPage from './ProjectDashboardPage'
import ProjectStatementPage from './ProjectStatementPage'
import ProjectUserPage from './ProjectUserPage'
import ProjectsPage from './ProjectsPage'
import SprintCostSummaryPage from './SprintCostSummaryPage'
import SprintDashboardPage from './SprintDashboardPage'
import SprintProposalPage from './SprintProposalPage'
import SprintRatePage from './SprintRatePage'
import SprintSnapshotPage from './SprintSnapshotPage'
import UserTimesheetPage from './UserTimesheetPage'
import SchedulesPage from './SchedulesPage'
import ScheduleItemPage from './ScheduleItemPage'
import WorkSummaryPage from './WorkSummaryPage'
import ProjectRoadmapPage from './ProjectRoadmapPage'
import ProjectWikiPage from './ProjectWikiPage'
import ReadOnlyPage from './ReadOnlyPage'
import ReleaseNotesPage from './ReleaseNotesPage'
import SprintsPage from './SprintsPage'
import FeaturesPage from './FeaturesPage'
import FlatFeaturesPage from './FlatFeaturesPage'
import ExecutiveSummaryPage from './ExecutiveSummaryPage'
import SimplifiedExecutiveSummaryPage from './SimplifiedExecutiveSummaryPage'
import TinyCardMenu from '../components/TinyCardMenu'
import TinyBudgetCard from '../components/TinyBudgetCard'
import TinyIssuesByStatusCard from '../components/TinyIssuesByStatusCard'
import TinyEstimatesByUserCard from '../components/TinyEstimatesByUserCard'
import VisualSpecDocumentGalleryFullScreenPage from '../components/visual_spec/VisualSpecDocumentGalleryFullScreenPage'
import WelcomePage from './WelcomePage'
import OnboardingRouter from '../components/onboarding/OnboardingRouter'
import { setBrowserTitle } from '../actions/Page'
import { LIST_KEY__TINY_ISSUES_CARD } from '../actions/ItemListKeyRegistry'
import TinyProblemsCard from '../components/TinyProblemsCard'

class MainRouter extends Component {

    render() {

        setBrowserTitle('ImpTime')
        
        return (
            <Switch>
              <Route exact path="/" component={WelcomePage}/>
              <Route exact path="/account/create" component={AccountCreatePage}/>
              <Route exact path="/account/created" component={AccountCreatedPage}/>
              <Route path="/onboarding" component={OnboardingRouter}/>
              <Route exact path="/work_summary" component={WorkSummaryPage}/>
              <Route exact path="/calendar/" component={CalendarPage}/>
              <Route exact path="/calendar/:scheduleId/" component={CalendarPage}/>
              <Route exact path="/calendar/:scheduleId/projects/:projectId" component={CalendarPage}/>
              <Route exact path="/calendar/:scheduleId/projects/:projectId/sprints/:sprintId" component={CalendarPage}/>
              <Route exact path="/calendar/:scheduleId/projects/:projectId/sprints/:sprintId/issues/:issueId" component={CalendarPage}/>
              <Route exact path="/clock/history/" component={ClockHistoryPage}/>
              <Route exact path="/clock/history/:filter" component={ClockHistoryPage}/>
              <Route exact path="/clock/history/issue/:issueId" component={ClockHistoryPage}/>
              <Route exact path="/companies/" component={CompaniesPage}/>
              <Route exact path="/companies/:companyId" component={CompaniesPage}/>
              <Route exact path="/companies/:companyId/users" component={CompanyUserPage}/>
              <Route exact path="/companies/:companyId/users/:userId/:viewMode" component={CompanyUserPage}/>
              <Route exact path="/companies/:companyId/invoices" component={InvoicesPage}/>
              <Route exact path="/schedule" component={SchedulesPage}/>
              <Route exact path="/schedule/:scheduleId" component={ScheduleItemPage}/>
              <Route exact path="/password/changed" component={PasswordChangedPage}/>
              <Route exact path="/password/change" component={ChangePasswordPage}/>
              <Route exact path="/company/problems" component={CompanyProblemPage}/>
              <Route exact path="/company/billable_hours" component={BillableHoursStatementPage}/>
              <Route exact path="/password/forgot" component={ForgotPasswordPage}/>
              <Route exact path="/password/reminded" component={PasswordReminderSentPage}/>
              <Route exact path="/release_notes_editor" component={ReleaseNotesPage}/>
              <Route exact path="/projects" component={ProjectsPage}/>
              <Route exact path="/projects/:projectId" component={ProjectsPage}/>
              <Route exact path="/projects/:projectId/dashboard" component={ProjectDashboardPage}/>
              <Route exact path="/projects/:projectId/journals" component={DecisionJournalPage}/>
              <Route exact path="/projects/:projectId/journals/:decisionJournalId" component={DecisionJournalPage}/>
              <Route exact path="/projects/:projectId/projectStatement" component={ProjectStatementPage}/>
              <Route exact path="/projects/:projectId/sprints" component={SprintsPage}/>
              <Route exact path="/projects/:projectId/features/flat" component={FlatFeaturesPage}/>
              <Route exact path="/projects/:projectId/features" component={FeaturesPage}/>
              <Route exact path="/projects/:projectId/bulkCreateFeatures" component={BulkFeatureCreatorPage}/>
              <Route exact path="/projects/:projectId/features/:featureId" component={FeaturesPage}/>
              <Route exact path="/projects/:projectId/roadmap" component={ProjectRoadmapPage}/>
              <Route exact path="/projects/:projectId/wiki/" component={ProjectWikiPage}/>
              <Route exact path="/projects/:projectId/wiki/:wikiId" component={ProjectWikiPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId" component={SprintsPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/dashboard" component={SprintDashboardPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/proposal" component={SprintProposalPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/rates" component={SprintRatePage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/executive_summary" component={ExecutiveSummaryPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/snapshots/:snapshotId" component={SprintSnapshotPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues" component={IssuesPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues/:issueId" component={IssuesPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/issues/:issueId/history" component={IssueHistoryPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/costSummary" component={SprintCostSummaryPage}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/bulkCreate" component={BulkIssueCreatorPage}/>
              <Route exact path="/projects/:projectId/users" component={ProjectUserPage}/>
              <Route exact path="/projects/:projectId/users/:userId/:viewMode" component={ProjectUserPage}/>

              <Route exact path="/wd/projects/:projectId/sprints/:sprintId/executive_summary" component={SimplifiedExecutiveSummaryPage}/>

              <Route exact path="/projects/:projectId/sprints/:sprintId/cards" component={TinyCardMenu}/>
              <Route exact path="/projects/:projectId/sprints/:sprintId/cards/budget" component={TinyBudgetCard} />
              <Route exact path="/projects/:projectId/sprints/:sprintId/cards/issues_by_status" component={(props) => <TinyIssuesByStatusCard list_key={LIST_KEY__TINY_ISSUES_CARD} {...props} />} />
              <Route exact path="/projects/:projectId/sprints/:sprintId/cards/estimates_by_user" component={TinyEstimatesByUserCard} />
              <Route exact path="/projects/:projectId/sprints/:sprintId/cards/problems" component={TinyProblemsCard} />
              
              <Route exact path="/fullscreen/projects/:projectId/image/:annotatedVisualSpecDocumentId" component={VisualSpecDocumentGalleryFullScreenPage}/>
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
