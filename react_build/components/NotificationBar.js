import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

export class NotificationBar extends Component {

    render() {

        const { error_message } = this.props

        return (
	    <div>
	    { error_message &&
              <div class="error">
		{ error_message }
	      </div>
	    }
	    </div>
        )
    }
}

function mapStateToProps(state, props) {
    const notification_bar = state.notification_bar || {}
    return {
        error_message: notification_bar.error_message
    }
}

export default connect(mapStateToProps)(NotificationBar)
