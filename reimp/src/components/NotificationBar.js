import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import map from 'lodash/map'
import { connect } from 'react-redux'
import moment from 'moment'
import {
    clearLoading,
    clearSaving
} from '../actions/Loading'

class NotificationBar extends Component {

    constructor(props) {
        super(props)
        this.onClearLoading = this.onClearLoading.bind(this)
        this.onClearSaving = this.onClearSaving.bind(this)
    }

    onClearLoading() {
        const { dispatch } = this.props
        dispatch(clearLoading())
    }

    onClearSaving() {
        const { dispatch } = this.props
        dispatch(clearSaving())
    }
    
    render() {

        const { error_message, is_websockets_connected, async_messages,
                is_loading, loading_action_key, is_saving, saving_action_key } = this.props

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
                { is_loading &&
                  <div className="notification_bar__loading" onClick={this.onClearLoading}>
                      Loading {loading_action_key}
                  </div>
                }
                { is_saving &&
                  <div className="notification_bar__saving" onClick={this.onClearSaving}>
                      Saving {saving_action_key}
                  </div>
                }
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const notification_bar = state.notification_bar || {}
    const websockets = state.websockets || {}
    const loading = state.loading
    return {
        error_message: notification_bar.error_message,
        async_messages: notification_bar.async_messages,
        is_websockets_connected: websockets.isConnected,
        is_loading: loading.is_loading,
        loading_action_key: loading.loading_action_key,
        is_saving: loading.is_saving,
        saving_action_key: loading.saving_action_key
    }
}

export default connect(mapStateToProps)(NotificationBar)
