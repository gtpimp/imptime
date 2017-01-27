import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import { connect } from 'react-redux'
import moment from 'moment'

class NotificationBar extends Component {

    render() {

        const { error_message, is_websockets_connected, async_messages } = this.props

        return (
	    <div>
	        { error_message &&
                  <div className="notification_bar__error">
		      { error_message }
	          </div>
	        }
                  { map(async_messages, function(msg, index) {

                        if ( moment().diff(msg.added_at, 'seconds') < 5 ) {
                            return (
                                <div key={index} className="notification_bar__async_msg">
                                    {msg.added_at.format('h:mm:ss')} {msg.msg}
                                </div>
                            )
                        } else {
                            return null
                        }
                    }
                )}
                { false && is_websockets_connected &&
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
        async_messages: notification_bar.async_messages,
        is_websockets_connected: websockets.isConnected
    }
}

export default connect(mapStateToProps)(NotificationBar)
