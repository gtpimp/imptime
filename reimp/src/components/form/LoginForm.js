import React, {Component} from 'react'
import {connect} from 'react-redux'
import { cx, css } from 'emotion'
import {login} from '../../actions/Auth'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import InputField from './InputField'

const inputFieldDiv = css`margin-bottom: 40px`

class LoginForm extends Component {

    constructor(props) {
        super(props)
        this.state = { show_otp_buttons: false, otp_sent_by_email: false, otp_sent_by_text_message: false }
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
            <form onSubmit={ handleSubmit }>
              <div className={inputFieldDiv}>
                <Field name="username" type="text" placeholder="Email Address" component={ InputField } />
              </div>
              <div className={cx(inputFieldDiv)}>
                <Field name="password" type="password" placeholder={(show_otp_buttons && "One time password") || "Password"} component={ InputField } />

              </div>

              <div className={css`margin-bottom: 20px;display:flex;justify-content:space-between`}>
                <PagePrimaryButton
                    label="SIGN IN"
                    type="submit"
                    disabled={submitting} />
                { !show_otp_buttons &&
                  <PagePrimaryButton
                      label="GET ONE TIME PASSWORD"
                      type="submit"
                      onButtonClick={this.onClickedGetOtp}
                      disabled={submitting} />
                }
              </div>

              { show_otp_buttons && (
                    <div className={css`margin-bottom: 20px`}>
                      <div className={css`margin-bottom: 10px`}>Send me a one time password via</div>
                      <div className={css`display: flex; justify-content:space-betweeen`}>
                        <div className={css`flex-grow: 1 `}>
                          <PagePrimaryButton
                              label="EMAIL"
                              disabled={submitting}
                              onButtonClick={this.onSendOtpEmail} />
                        </div>
                        <div className={css`width: ${theme.spacing.one}`}/>
                        <div className={css`flex-grow: 1 `}>
                          <PagePrimaryButton
                              label="TEXT MESSAGE"
                              disabled={submitting}
                              onButtonClick={this.onSendOtpTextMessage} />
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
            </form>
        )
    }
}
function mapStateToProps(state, props) {
    return {
        settings: state.settings
    }
}
export default withRouter(connect(mapStateToProps)(reduxForm({form:'login_page'})(LoginForm)))
