import React, {Component} from 'react'
import {connect} from 'react-redux'
import {login} from '../actions/Auth'
import {browserHistory} from 'react-router'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.onLogin = this.onLogin.bind(this)
        this.onClickedForgotPassword = this.onClickedForgotPassword.bind(this)
    }

    onLogin(values) {
        const { dispatch, settings } = this.props
        return dispatch(login(values.username, values.password))
    }

    onClickedForgotPassword() {
        browserHistory.push('/password/forgot');
    }
    
    render() {

        const that = this
        const { handleSubmit, error, submitting } = this.props
        
        return (
            <div className="login-page">
                <div className="login-page__header">
                    <div className="login-page__logo"></div>
                    <div className="login-page__title">Log In</div>
                </div>

                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Log In</div>
                        <div className="login__body">
                            <form onSubmit={handleSubmit(this.onLogin)}>
                                <Field name="username" type="text" placeholder="Email Address" component="input" />
                                <Field name="password" type="password" placeholder="Password" component="input" />
                                { error &&
                                  <div className="login-form__message">
                                      <Message variant="error">Invalid username/password combination</Message>
                                  </div>
                                }
                                <button disabled={submitting} type="submit" className="button button--large button--login">Log In</button>
                                <div className="login__forgot-password-link" onClick={this.onClickedForgotPassword}>forgot password?</div>
                                <a className="button button--large" href="http://api.imptime.com">Go to old ImpTime</a>
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

export default connect(mapStateToProps)(reduxForm({form:'login_page'})(LoginPage))
