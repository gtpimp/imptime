import {createStore} from 'redux'
import React from 'react';
import {syncHistoryWithStore} from 'react-router-redux'
import {IndexRoute, Router, Route, browserHistory} from 'react-router'
import {Provider} from 'react-redux'
import ReactDOM from 'react-dom';
import App from './containers/App';
import './sass/imptime.css'
import configureStore from './store/configureStore'
import ProjectsPage from './containers/ProjectsPage'
import ClientsPage from './containers/ClientsPage'
import TeamPage from './containers/TeamPage'
import MainLayout from './components/MainLayout'
import DevPage from './containers/DevPage'

/* /projects
 /projects/{project-id}
 /projects/{project-id}/sprints
 /projects/{project-id}/sprints/{sprint-id}
 /projects/{project-id}/issues/{issue-id}*/

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route component={MainLayout}>
                <IndexRoute component={DevPage}/>
                <Route path="/" component={DevPage}/>
                <Route path="projects" component={ProjectsPage}/>
                <Route path="clients" component={ClientsPage}/>
                <Route path="team" component={TeamPage}/>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('root')
)
