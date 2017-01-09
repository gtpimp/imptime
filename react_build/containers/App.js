import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd';
var HTML5Backend = require('react-dnd-html5-backend');
import DevPage from './DevPage'
import HeaderBar from '../components/HeaderBar'
import Websocket from '../components/Websocket'
import { asyncRefreshNotification, websocketDisconnected, websocketConnected } from '../actions/Async'

class App extends Component {

    constructor(props) {
        super(props)
        this.onRefreshFromSocket = this.onRefreshFromSocket.bind(this)
        this.onDisconnectFromSocket = this.onDisconnectFromSocket.bind(this)
        this.onConnectFromSocket = this.onConnectFromSocket.bind(this)
    }
    
    componentDidMount() {
        const { dispatch } = this.props

        window.onerror = function(msg, url, line, col, error) {
	    //alert("whoops")
        }
    }

    onDisconnectFromSocket() {
        const { dispatch } = this.props
        console.log("Websocket disconnected")
        dispatch(websocketDisconnected())
    }

    onConnectFromSocket() {
        const { dispatch } = this.props
        console.log("Websocket connected")
        dispatch(websocketConnected())
    }

    onRefreshFromSocket(data) {
        const { dispatch } = this.props
        console.log("Websocket refreshed")
        dispatch(asyncRefreshNotification(data))
    }    

    render() {
        const {} = this.props

        return (
            <div className="app">

                <Websocket url={"ws://" + window.location.host + "/refresh/"}
                           debug={true}
                           onMessage={this.onRefreshFromSocket}
                           onConnect={this.onConnectFromSocket}
                           onDisconnect={this.onDisconnectFromSocket}
                />                
                
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

