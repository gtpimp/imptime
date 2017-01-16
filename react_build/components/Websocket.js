import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { asyncRefreshNotification, websocketDisconnected, websocketConnected } from '../actions/Async'

class Websocket extends Component {

    constructor(props) {
        super(props);
        this.onMessageFromSocket = this.onMessageFromSocket.bind(this)
        this.onDisconnectFromSocket = this.onDisconnectFromSocket.bind(this)
        this.onConnectFromSocket = this.onConnectFromSocket.bind(this)
        this.state = {
            ws: new WebSocket(this.props.url),
            attempts: 1
        };
    }

    componentDidMount() {
        this.setupWebsocket();
    }

    componentWillUnmount() {
        let websocket = this.state.ws;
        websocket.close();
    }

    logging(logline) {
        const { debug } = this.props
        if ( debug ) {
            console.log(logline);
        }
    }

    generateInterval (k) {
        return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
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

    onMessageFromSocket(data) {
        const { dispatch } = this.props
        console.log("Websocket refreshed")
        dispatch(asyncRefreshNotification(data))
    }    

    setupWebsocket() {
        this.state.ws = this.state.ws || new WebSocket(this.props.url);
        let websocket = this.state.ws;

        websocket.onopen = () => {
            this.logging('Websocket connected');
            this.onConnectFromSocket();
        };

        websocket.onmessage = (evt) => {
            console.log("websocket message" + evt.data)
            this.onMessageFromSocket(evt.data);
        };

        websocket.onclose = () => {
            this.logging('Websocket disconnected');
            this.onDisconnectFromSocket()

            if (this.props.reconnect) {
                let time = this.generateInterval(this.state.attempts);
                this.state.ws = null;
                setTimeout(() => {
                    this.setState({attempts: this.state.attempts++});
                    this.setupWebsocket();
                }, time);
            }
        }
    }

    render() {
        return (
            <div></div>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        reconnect: true,
        debug: true
    }
}

export default connect(mapStateToProps)(Websocket)
