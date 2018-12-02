import React, {Component, Fragment } from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import InputField from './InputField'

const FORM_NAME = 'confirm_otp_login_form'
const required = value => (value ? undefined : 'Required')

class ConfirmOtpLoginForm extends Component {

    render() {
        const { email_or_mobile_value, login_method, error, submit, submitting } = this.props

        let placeholder
        if (login_method === 'email') {
            placeholder = 'Email One Time Pin'
        } else if (login_method === 'sms') {
            placeholder = 'Sms One Time Pin'
        }

        return (
            <Fragment>
              <div className={otp_instruction}>
                {`We've sent a pin to ${email_or_mobile_value}.`}
              </div>
              <div className={inputFieldDiv}>
                <Field
                    name="otp"
                    type="text"
                    validate={[required]}
                    placeholder={placeholder}
                    component={ InputField } />
              </div>
              <div className={otp_actions}>
                <PagePrimaryButton
                    label="Login"
                    onButtonClick={submit}
                    disabled={submitting} />
                <a className={btn_link}>
                  I didn't recieve a pin
                </a>
              </div>
                { error &&
                  <div className="login-form__message">
                    <Message variant="error">{ error && error }</Message>
                  </div>
                }
            </Fragment>
        )
    }
}
function mapStateToProps(state, props) {
    const { match } = props
    
    const login_method = match.params.login_method

    const email_or_mobile_value = match.params.username
    
    return {
        email_or_mobile_value,
        login_method
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
    form: FORM_NAME })(ConfirmOtpLoginForm)))

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
margin-bottom: 10px;
text-align: left;
`

const btn_link = css`
color: blue;
cursor: pointer;
`
