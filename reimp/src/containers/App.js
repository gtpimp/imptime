import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd';
var HTML5Backend = require('react-dnd-html5-backend');
import DevPage from './DevPage'
import HeaderBar from '../components/HeaderBar'
import Websocket from '../components/Websocket'
import LoginPage from '../containers/LoginPage'
import { is_authenticated } from '../actions/Auth'
import { WEBSOCKET_BASE_URL } from '../settings'

class App extends Component {

    constructor(props) {
        super(props)
    }
    
    componentDidMount() {
        const { dispatch } = this.props

        window.onerror = function(msg, url, line, col, error) {
	    //alert("whoops")
        }
    }

    render() {
        const { is_logged_in } = this.props

        return (
            <div>
            { ! is_logged_in &&
              <LoginPage/>
            }
            { is_logged_in &&
              (
                  <div className="app">

                      { <Websocket url={WEBSOCKET_BASE_URL+"/refresh"} /> }
                      
		      <HeaderBar/>
		      
		      <DevPage/>

	          </div>
              )
            }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        is_logged_in: is_authenticated()
    }
}

export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(App))

