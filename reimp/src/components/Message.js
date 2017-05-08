import React, {Component} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import '../sass/message.css'

class Message extends Component {

    render() {
        return (
            <div className={classnames('message', 'message--' + this.props.variant)}>
                { this.props.children }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        variant: props.variant || 'info'
    }
}


export default connect(mapStateToProps)(Message)
