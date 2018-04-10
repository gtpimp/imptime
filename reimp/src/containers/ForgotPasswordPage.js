import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { forgot_password } from '../actions/Auth'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class ForgotPasswordPage extends Component {

    constructor(props) {
        super(props)
        this.onForgotPassword = this.onForgotPassword.bind(this)
    }

    onForgotPassword(values) {
        const { dispatch, history } = this.props
        return dispatch(forgot_password(values.username,
                                        () => history.push("/password/reminded")))
    }
    
    render() {
        const { handleSubmit, error, submitting } = this.props
        
        return (
            <div className="login-page">
                <div className="login-page__header">
                    <div className="login-page__logo"></div>
                    <div className="login-page__title">Forgot Password</div>
                </div>

                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Forgot Password</div>
                        <div className="login__body">
                            <form onSubmit={handleSubmit(this.onForgotPassword)}>
                                <Field name="username" type="text" placeholder="Username or email" component="input" />
                                { error &&
                                  <div className="login-form__message">
                                      <Message variant="error">Invalid username</Message>
                                  </div>
                                }
                                <button disabled={submitting} type="submit" className="button button--large button--login">Remind me</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
        settings: state.settings
    }
}

export default withRouter(connect(mapStateToProps)(reduxForm({form:'forgot_password_page'})(ForgotPasswordPage)))
