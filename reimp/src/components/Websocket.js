import React, { Component } from 'react'
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

    componentWillReceiveProps(new_props) {
        if ( new_props.url !== this.props.url ) {
            this.state.ws.close()
            this.setState({ws: new WebSocket(new_props.url)})
        }
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
        dispatch(websocketConnected())
    }

    onMessageFromSocket(data) {
        const { dispatch } = this.props
        dispatch(asyncRefreshNotification(data))
    }    

    setupWebsocket() {
        if(!this.state.ws){
            this.setState({ws: new WebSocket(this.props.url)})
        }
        let websocket = this.state.ws;

        websocket.onopen = () => {
            this.onConnectFromSocket();
        };

        websocket.onmessage = (evt) => {
            this.onMessageFromSocket(evt.data);
        };

        websocket.onclose = () => {
            this.logging('Websocket disconnected');
            this.onDisconnectFromSocket()

            if (this.props.reconnect) {
                let time = this.generateInterval(this.state.attempts);
                this.setState({ws: null})
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
    const url = state.settings.WEBSOCKET_BASE_URL
    return {
        reconnect: true,
        debug: true,
        url: url
    }
}

export default connect(mapStateToProps)(Websocket)
