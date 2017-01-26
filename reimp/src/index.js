import { createStore } from 'redux'
import React from 'react';
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom';
import App from './containers/App';
// import './sass/imptime.css'
import configureStore from './store/configureStore'
import ProjectList from './components/ProjectList'
import SprintList from './components/SprintList'

/* /projects
   /projects/{project-id}
   /projects/{project-id}/sprints
   /projects/{project-id}/sprints/{sprint-id}
   /projects/{project-id}/issues/{issue-id}*/

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    {}
    <Router history={history}>
        <Route path="/" component={App}>
            <Route path="/projects" component={ProjectList}>
                <Route path="/projects" component={ProjectList}></Route>
                <Route path="/projects/:projectRef" component={SprintList}></Route>
            </Route>
        </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
