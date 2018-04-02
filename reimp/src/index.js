import './sass/imptime.css'
import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from './store/configureStore'
import {Provider} from 'react-redux'
import Raven from 'raven-js'
import { BrowserRouter } from 'react-router-dom'
import MainRouter from './containers/MainRouter'

const store = configureStore({})

const RAVEN_DSN = (window.LOCAL_SETTINGS || {}).RAVEN_DSN
if (RAVEN_DSN) {
    Raven.config(RAVEN_DSN).install()
}


ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <MainRouter />
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
)
