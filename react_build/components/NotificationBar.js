import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

class NotificationBar extends Component {

    render() {

        const { error_message, is_websockets_connected } = this.props

        return (
	    <div>
	        { error_message &&
                  <div className="notification_bar__error">
		      { error_message }
	          </div>
	        }
                { is_websockets_connected &&
                  <div className="notification_bar__websockets_connected">
                      Websockets OK
                  </div>
                }
                { ! is_websockets_connected &&
                  <div className="notification_bar__websockets_disconnected">
                      Websockets Not OK
                  </div>
                }                
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const notification_bar = state.notification_bar || {}
    const websockets = state.websockets || {}
    return {
        error_message: notification_bar.error_message,
        is_websockets_connected: websockets.isConnected
    }
}

export default connect(mapStateToProps)(NotificationBar)
