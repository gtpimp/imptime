import React from 'react';
import ReactDOM from 'react-dom';

class Websocket extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ws: new WebSocket(this.props.url),
            attempts: 1
        };
    }

    logging(logline) {
        if (this.props.debug === true) {
            console.log(logline);
        }
    }

    generateInterval (k) {
        return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
    }

    setupWebsocket() {
        this.state.ws = this.state.ws || new WebSocket(this.props.url);
        let websocket = this.state.ws;
        

        const { onDisconnect, onConnect } = this.props

        websocket.onopen = () => {
            this.logging('Websocket connected');
            onConnect && onConnect()
        };

        websocket.onmessage = (evt) => {
            this.props.onMessage(evt.data);
        };

        websocket.onclose = () => {
            this.logging('Websocket disconnected');
            onDisconnect && onDisconnect()

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

    componentDidMount() {
        this.setupWebsocket();
    }

    componentWillUnmount() {
        let websocket = this.state.ws;
        websocket.close();
    }

    render() {
        return (
            <div></div>
        );
    }
}

Websocket.defaultProps = {
    debug: false,
    reconnect: true
};

Websocket.propTypes = {
    url: React.PropTypes.string.isRequired,
    onMessage: React.PropTypes.func.isRequired,
    debug: React.PropTypes.bool,
    reconnect: React.PropTypes.bool,
};

export default Websocket;
