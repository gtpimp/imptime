import { createStore } from 'redux'
import React from 'react';
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom';
import App from './containers/App';
import './sass/imptime.css'
import configureStore from './store/configureStore'

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    {}
    <Router history={history}>
        <Route path="/" component={App}></Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
