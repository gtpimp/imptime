import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import { cx, css } from 'emotion'
import { login, isValidEmail } from '../../actions/Auth'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import InputField from './InputField'

const FORM_NAME = 'login_page'
const valueSelector = formValueSelector(FORM_NAME)

class LoginForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            show_otp_buttons: false,
            otp_sent_by_email: false,
            otp_sent_by_text_message: false,
            invalid_email_address: false
        }
    }

    onClickedGetOtp = (evt) => {
        evt.preventDefault()
        const { username } = this.props
        if (!isValidEmail(username)) {
            this.setState({invalid_email_address: true})
        } else {
            this.setState({
                show_otp_buttons: true,
                invalid_email_address: false
            })
        }
    }

    onSendOtpTextMessage = (evt) => {
        this.setState({
            otp_sent_by_text_message: true,
            otp_sent_by_email: false
        })
    }

    onSendOtpEmail = (evt) => {
        this.setState({
            otp_sent_by_email: true,
            otp_sent_by_text_message: false
        })
    }

    renderOtpSection = () => {
        const { submitting } = this.props
        const {
            show_otp_buttons,
            otp_sent_by_text_message,
            otp_sent_by_email
        } = this.state

        return (
            <Fragment>
              { show_otp_buttons && (
                    <div className={ otp_section_main }>
                      <p className={ otp_instruction }>Send me a one time password via</p>
                      <div className={ otp_actions }>
                        <PagePrimaryButton
                            label="EMAIL"
                            disabled={submitting}
                            onButtonClick={this.onSendOtpEmail} />
                        <PagePrimaryButton
                            label="TEXT MESSAGE"
                            disabled={submitting}
                            onButtonClick={this.onSendOtpTextMessage} />
                      </div>

                      { (otp_sent_by_email || otp_sent_by_text_message) && (
                            <div className={css`margin-top: ${theme.spacing.two}; color: ${theme.colours.ok}; font: ${theme.fonts.regular_normal};line-height: 1.8;`}>
                              { otp_sent_by_email && "If an ImpTime account exists for this email address, an email will be sent with your one time password" }
                              { otp_sent_by_text_message && "If an ImpTime account exists for this email address, a text message will be sent with your one time password" }
                            </div>
                      )}
                    </div>
              )}
            </Fragment>
        )
    }

    render() {
        const { handleSubmit, error, submitting } = this.props
        const {
            show_otp_buttons,
            invalid_email_address
        } = this.state

        return (
            <form onSubmit={ handleSubmit }>
              <div className={inputFieldDiv}>
                <Field
                    name="username"
                    type="text"
                    placeholder="Email Address"
                    component={ InputField } />
              </div>
              <div className={inputFieldDiv}>
                <Field
                    name="password"
                    type="password"
                    placeholder={(show_otp_buttons && "One time password") || "Password"}
                    component={ InputField } />
              </div>
              <div className={ form_actions }>
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
              { this.renderOtpSection() }

              { error &&
                <div className="login-form__message">
                  <Message variant="error">{ error && error }</Message>
                </div>
              }

              { invalid_email_address &&
                <div className="login-form__message">
                  <Message variant="error">Please enter your email address</Message>
                </div>
              }
            </form>
        )
    }
}
function mapStateToProps(state, props) {
    return {
        settings: state.settings,
        username: valueSelector(state, 'username'),
    }
}
export default withRouter(connect(mapStateToProps)(reduxForm({form:FORM_NAME})(LoginForm)))

const inputFieldDiv = css`margin-bottom: 40px`

const form_actions = css`
margin-bottom: 34px;
display:flex;
justify-content: space-between;
`

const otp_section_main = css`
margin-bottom: 18px;
justify-content: center;
align-items: center;
border-top: 1px solid #e0e0e0;
padding-top: 18px;
`

const otp_actions = css`
display: flex;
flex: 1;
align-items: center;
justify-content:space-between;
padding-top: 18px;
`

const otp_instruction = css`
font: ${theme.fonts.regular_large};
margin: 0;
text-align: center;
`
