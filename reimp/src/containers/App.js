import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd';
var HTML5Backend = require('react-dnd-html5-backend');
import DevPage from './DevPage'
import HeaderBar from '../components/HeaderBar'
import Websocket from '../components/Websocket'
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
        const {} = this.props

        return (
            <div className="app">

                { <Websocket url={WEBSOCKET_BASE_URL+"/refresh"} /> }
                
		<HeaderBar/>
		
		<DevPage/>
	    </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {
    }
}

export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(App))

