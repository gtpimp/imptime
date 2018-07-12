import React, {Component} from 'react'
import {connect} from 'react-redux'
import {login} from '../actions/Auth'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.onLogin = this.onLogin.bind(this)
        this.onClickedForgotPassword = this.onClickedForgotPassword.bind(this)
        this.onClickedCreateAccount = this.onClickedCreateAccount.bind(this)
    }

    onLogin(values) {
        const { dispatch } = this.props
        return dispatch(login(values.username, values.password))
    }

    onClickedForgotPassword(evt) {
        const { history } = this.props
        if ( evt ) {
            evt.preventDefault()
        }
        history.push('/password/forgot');
    }

    onClickedCreateAccount(evt) {
        const { history } = this.props
        if ( evt ) {
            evt.preventDefault()
        }
        history.push('/account/create');
    }

    render() {

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
                                  <div className="login__secondary_buttons">
                                    <button className="button button--large login__forgot-password-link" onClick={this.onClickedForgotPassword}>forgot password</button>
                                    <button className="button button--large" onClick={this.onClickedCreateAccount}>New account</button>
                                  </div>
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

export default withRouter(connect(mapStateToProps)(reduxForm({form:'login_page'})(LoginPage)))
