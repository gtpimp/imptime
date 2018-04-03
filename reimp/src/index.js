import './sass/imptime.css'
import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './store/configureStore'
import {Provider} from 'react-redux'
import Raven from 'raven-js'
import { Router } from 'react-router-dom'
import MainLayout from './containers/MainLayout'
import history from './history'

const store = configureStore({})

const RAVEN_DSN = (window.LOCAL_SETTINGS || {}).RAVEN_DSN
if (RAVEN_DSN) {
    Raven.config(RAVEN_DSN).install()
}


ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <MainLayout />
      </Router>
    </Provider>,
    document.getElementById('root')
)
