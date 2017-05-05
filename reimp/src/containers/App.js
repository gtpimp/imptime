import React, { Component } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd';
var HTML5Backend = require('react-dnd-html5-backend');
import DevPage from './DevPage'
import Header from '../components/Header'
import Websocket from '../components/Websocket'
import LoginPage from '../containers/LoginPage'
import { is_authenticated } from '../actions/Auth'
import { updateSettings } from '../actions/Settings'

class App extends Component {

    componentDidMount() {
        const { dispatch } = this.props

        /* window.onerror = function(msg, url, line, col, error) {
	   //alert("whoops")
         * }*/
    }

    render() {
        const { is_logged_in, are_settings_loaded } = this.props

        if ( ! are_settings_loaded ) {
            return (
                <div>Loading settings...</div>
            )
        }

        return (
            <div>
            { ! is_logged_in &&
              <LoginPage/>
            }
            { is_logged_in &&
              (
                  <div className="app">
                      <Websocket/>
		      <Header/>
		      <DevPage/>

	          </div>
              )
            }
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { configured } = state.settings
    return {
        is_logged_in: is_authenticated(),
        are_settings_loaded: configured
    }
}

export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(App))
