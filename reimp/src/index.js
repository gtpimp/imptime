import './sass/imptime.css'
import BulkIssueCreatorPage from './containers/BulkIssueCreatorPage'
import ChangePasswordPage from './containers/ChangePasswordPage'
import ClientsPage from './containers/ClientsPage'
import DashboardPage from './containers/DashboardPage'
import DevPage from './containers/DevPage'
import ForgotPasswordPage from './containers/ForgotPasswordPage'
import IssuesPage from './containers/IssuesPage'
import MainLayout from './components/MainLayout'
import PasswordReminderSentPage from './containers/PasswordReminderSentPage'
import ProjectDashboardPage from './containers/ProjectDashboardPage'
import ProjectStatementPage from './containers/ProjectStatementPage'
import ProjectUserPage from './containers/ProjectUserPage'
import ProjectsPage from './containers/ProjectsPage'
import React from 'react';
import ReactDOM from 'react-dom';
import SprintCostSummaryPage from './containers/SprintCostSummaryPage'
import SprintDashboardPage from './containers/SprintDashboardPage'
import UserTimesheetPage from './containers/UserTimesheetPage'
import ReleaseNotesPage from './containers/ReleaseNotesPage'
import SprintsPage from './containers/SprintsPage'
import SprintTemplatesPage from './containers/SprintTemplatesPage'
import VisualSpecDocumentPage from './components/visual_spec/VisualSpecDocumentPage'
import TeamPage from './containers/TeamPage'
import configureStore from './store/configureStore'
import {IndexRoute, Router, Route, browserHistory} from 'react-router'
import {Provider} from 'react-redux'
import {syncHistoryWithStore} from 'react-router-redux'
import Raven from 'raven-js'

/* /projects
 /projects/{project-id}
 /projects/{project-id}/sprints
 /projects/{project-id}/sprints/{sprint-id}
 /projects/{project-id}/issues/{issue-id}*/

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

const RAVEN_DSN = (window.LOCAL_SETTINGS || {}).RAVEN_DSN
if (RAVEN_DSN) {
    Raven.config(RAVEN_DSN).install()
}

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route component={MainLayout}>
                <IndexRoute component={ProjectsPage}/>
                <Route path="/" component={ProjectsPage}/>
                <Route path="/password/change" component={ChangePasswordPage}/>
                <Route path="/password/forgot" component={ForgotPasswordPage}/>
                <Route path="/password/reminded" component={PasswordReminderSentPage}/>
                <Route path="dev" component={DevPage}/>
                <Route path="release_notes_editor" component={ReleaseNotesPage}/>
                <Route path="projects" component={ProjectsPage}/>
                <Route path="projects/:projectId" component={ProjectDashboardPage}/>
                <Route path="projects/:projectId/projectStatement" component={ProjectStatementPage}/>
                <Route path="projects/:projectId/sprints" component={SprintsPage}/>
                <Route path="projects/:projectId/sprintTemplates" component={SprintTemplatesPage}/>
                <Route path="projects/:projectId/sprints/:sprintId" component={SprintDashboardPage}/>
                <Route path="projects/:projectId/sprints/:sprintId/issues" component={IssuesPage}/>
                <Route path="projects/:projectId/sprints/:sprintId/issues/:issueId" component={IssuesPage}/>
                <Route path="projects/:projectId/sprints/:sprintId/costSummary" component={SprintCostSummaryPage}/>
                <Route path="projects/:projectId/sprints/:sprintId/bulkCreate" component={BulkIssueCreatorPage}/>
                <Route path="projects/:projectId/users" component={ProjectUserPage}/>
                <Route path="projects/:projectId/users/:userId" component={ProjectUserPage}/>
                <Route path="projects/:projectId/sprints/:sprintId/issues/:issueId/visualSpec/:visualSpecDocumentId" component={VisualSpecDocumentPage}/>

                <Route path="dashboard" component={DashboardPage}/>
                <Route path="usertimesheets" component={UserTimesheetPage}/>
                <Route path="clients" component={ClientsPage}/>
                <Route path="team" component={TeamPage}/>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('root')
)
