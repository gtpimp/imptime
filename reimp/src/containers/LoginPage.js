import React, {Component} from 'react'
import {connect} from 'react-redux'
import { cx, css } from 'emotion'
import {login} from '../actions/Auth'
import { default_theme as theme } from '../theme/default'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

const inputFieldDiv = css`margin-bottom: 40px`

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.onLogin = this.onLogin.bind(this)
        this.onClickedForgotPassword = this.onClickedForgotPassword.bind(this)
        this.onClickedCreateAccount = this.onClickedCreateAccount.bind(this)
        this.state = { show_otp_buttons: false, otp_sent_by_email: false, otp_sent_by_text_message: false }
    }

    onLogin(values) {
        const { dispatch } = this.props
        this.setState({show_otp_buttons: false})
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

    onClickedGetOtp = (evt) => {
        evt.preventDefault()
        this.setState({show_otp_buttons: true})
    }

    onSendOtpTextMessage = (evt) => {
        this.setState({otp_sent_by_text_message: true,
                       otp_sent_by_email: false})
    }

    onSendOtpEmail = (evt) => {
        this.setState({otp_sent_by_email: true,
                       otp_sent_by_text_message: false})
    }

    render() {

        const { handleSubmit, error, submitting } = this.props
        const { show_otp_buttons, otp_sent_by_text_message, otp_sent_by_email } = this.state
        
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Sign in to ImpTime</div>
                        <div className="login__body">
                          <form onSubmit={handleSubmit(this.onLogin)}>
                            <div className={inputFieldDiv}>
                              <Field name="username" type="text" placeholder="Email Address" component="input" />
                            </div>
                            <div className={cx(inputFieldDiv)}>

                              { false && 
                                <div className={css`float:right; margin-top: ${theme.spacing.one};`}>
                                  <a className="login__link" href="#" onClick={this.onClickedForgotPassword}>Forgot password?</a>
                                </div>
                              }
                              <Field name="password" type="password" placeholder={(show_otp_buttons && "One time password") || "Password"} component="input" />

                            </div>

                            <div className={css`margin-bottom: 20px;display:flex;justify-content:space-between`}>
                              <button disabled={submitting} type="submit" className="button button--large button--login">SIGN IN</button>
                              { !show_otp_buttons &&
                                <button disabled={submitting} type="submit" className="button button--large"
                                        onClick={this.onClickedGetOtp}>GET ONE TIME PASSWORD</button>
                              }
                            </div>

                            { show_otp_buttons && (
                                  <div className={css`margin-bottom: 20px`}>
                                    <div className={css`margin-bottom: 10px`}>Send me a one time password via</div>
                                    <div className={css`display: flex; justify-content:space-betweeen`}>
                                      <div className={css`flex-grow: 1 `}>
                                        <a href="#" onClick={this.onSendOtpEmail}
                                           disabled={submitting}
                                           className={cx("button button--large button-action", css`padding-left: ${theme.horizontal_row_space_tight}; padding-right: ${theme.horizontal_row_space_tight}`)}>
                                          EMAIL
                                        </a>
                                      </div>
                                      <div className={css`width: ${theme.spacing.one}`}/>
                                      <div className={css`flex-grow: 1 `}>
                                        <a href="#" onClick={this.onSendOtpTextMessage}
                                           disabled={submitting}
                                           className={cx("button button--large button-action", css`padding-left: ${theme.horizontal_row_space_tight}; padding-right: ${theme.horizontal_row_space_tight}`)}>
                                          TEXT MESSAGE
                                        </a>
                                      </div>
                                    </div>
                                  { (otp_sent_by_email || otp_sent_by_text_message) && (
                                      <div className={css`margin-top: ${theme.spacing.two}; color: ${theme.colours.ok}; font: ${theme.fonts.regular_normal};line-height: 1.8;`}>
                                        { otp_sent_by_email && "If an ImpTime account exists for this email address, an email will be sent with your one time password" }
                                        { otp_sent_by_text_message && "If an ImpTime account exists for this email address, a text message will be sent with your one time password" }
                                      </div>
                                  )}
                                  </div>
                            )}

                            { error &&
                              <div className="login-form__message">
                                  <Message variant="error">Invalid username/password combination</Message>
                              </div>
                            }
                            <div className="login__secondary_buttons"> 
                              <a href="#" className={cx("login__link--strong",css`margin-left:auto; margin-right: auto;`)}
                                 onClick={this.onClickedCreateAccount}>
                                Create an account
                              </a>
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
