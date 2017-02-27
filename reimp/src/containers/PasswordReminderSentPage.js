import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { change_password } from '../actions/Auth'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class PasswordReminderSentPage extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const that = this
        const { handleSubmit, error, submitting } = this.props
        
        return (
            <div className="login-page">
                Your password has been reset. Check your email for the link to reset it.
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default connect(mapStateToProps)(PasswordReminderSentPage)
