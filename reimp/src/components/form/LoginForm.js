import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { isValidEmail, sendOtpEmail } from '../../actions/Auth'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import CardDynamicDropdownField from '../CardDynamicDropdownField'
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
        this.login_options = [{value: 'email', label: 'Send one time password via email'},
                              {value: 'text', label: 'Send one time password via text'},
                              {value: 'password', label: 'Enter password'}
        ]
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

    onSendOtpTextMessage = () => {
        const { submit } = this.props        
        this.setState({
            otp_sent_by_text_message: true,
            otp_sent_by_email: false
        })
        return submit()
    }

    onSendOtpEmail = () => {
        const { submit } = this.props
        
        this.setState({
            otp_sent_by_email: true,
            otp_sent_by_text_message: false
        })
        return submit()
    }

    renderOtpSection = () => {
        const { submitting, submit } = this.props
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

    renderPasswordInput() {
        const { login_method } = this.props
        const { show_otp_buttons } = this.state

        if (login_method === 'password') {
            return (
                <div className={inputFieldDiv}>
                  <Field
                      name="password"
                      type="password"
                      placeholder={(show_otp_buttons && "One time password") || "Password"}
                      component={ InputField } />
                </div>
            )
        }
    }

    renderButtons() {
        const { submit, login_method, submitting } = this.props
        const { show_otp_buttons } = this.state
        
        return (
            <div className={ form_actions }>
              { login_method === 'password' &&
                <PagePrimaryButton
                    label="SIGN IN"
                    type="submit"
                    onButtonClick={submit}
                    disabled={submitting} />
              }
              { !show_otp_buttons &&
                (login_method === "email" ||
                 login_method === "text") &&
                <PagePrimaryButton
                    label="GET ONE TIME PASSWORD"
                    type="submit"
                    onButtonClick={this.onClickedGetOtp}
                    disabled={submitting} />
              }
            </div>
        )
    }

    render() {
        const { error } = this.props
        const { invalid_email_address } = this.state

        return (
            <form>
              <div className={inputFieldDiv}>
                <Field
                    name="username"
                    type="text"
                    placeholder="Email Address"
                    component={ InputField } />
              </div>
              <div className={inputFieldDiv}>
                <Field
                    name="login_method"
                    placeholder="Choose authentication method"
                    options={this.login_options}
                    value_key="value"
                    component={ CardDynamicDropdownField } />
              </div>
              { this.renderPasswordInput() }
              { this.renderButtons() }
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
function mapStateToProps(state) {
    return {
        settings: state.settings,
        username: valueSelector(state, 'username'),
        login_method: valueSelector(state, 'login_method'),
    }
}

export default withRouter(connect(mapStateToProps)(reduxForm({
    onSubmit: (new_values, dispatch, props) => {
        const { onFormSubmit } = props
        return onFormSubmit(new_values)
    },
    onSubmitSuccess: (res, dispatch, props) => {
        const { onFormSubmitSuccess } = props
        return onFormSubmitSuccess(res)
    },
    form: FORM_NAME })(LoginForm)))

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
justify-content: space-between;
padding-top: 18px;
`

const otp_instruction = css`
font: ${theme.fonts.regular_large};
margin: 0;
text-align: center;
`
