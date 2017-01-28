import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import Header from '../components/Header'
import Websocket from '../components/Websocket'

class MainLayout extends Component {

    render() {

        return (
            <div className="app">
                <Websocket/>
                <Header/>
                <div className="main">
                {this.props.children}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default connect(mapStateToProps)(MainLayout)

