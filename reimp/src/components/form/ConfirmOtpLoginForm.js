import React, {Component, Fragment } from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { Link } from 'react-router-dom'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import InputField from './InputField'

const FORM_NAME = 'confirm_otp_login_form'
const required = value => (value ? undefined : 'Required')

class ConfirmOtpLoginForm extends Component {

    keyDown = (event) => {
        const { submit } = this.props
        if (event.keyCode === 13) {
            event.preventDefault()
            submit()
        }
    }
    
    render() {
        const { email, login_method, error, submit, submitting } = this.props

        let placeholder
        if (login_method === 'email') {
            placeholder = 'One time pin'
        } else if (login_method === 'sms') {
            placeholder = 'One time pin'
        }

        return (
            <Fragment>
              <div className={otp_instruction}>
                <div>
                  {`We've sent a pin to ${email}`} &nbsp;
                </div>
              </div>
              <div className={inputFieldDiv}>
                <Field
                    name="password"
                    type="text"
                    validate={[required]}
                    placeholder={placeholder}
                    component={ InputField }
                    autoFocus
                    onKeyDown={this.keyDown}
                />
                <div className={pin_failure}>
                  <Link className={btn_link}
                      to={`/account/pin-failure/${email}`}>
                      {"I didn't receive a pin"}
                  </Link>
                </div>
              </div>
              <div className={otp_actions}>
                <PagePrimaryButton
                    label="Login"
                    onButtonClick={submit}
                    disabled={submitting} />
                <Link
                    className={btn_link}
                    to="/">
                  Back
                </Link>
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

    const email = match.params.username || props.email
    
    return {
        email,
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
        if ( onFormSubmitSuccess ) {
            return onFormSubmitSuccess(res)
        }
    },
    form: FORM_NAME })(ConfirmOtpLoginForm)))

const inputFieldDiv = css`margin-bottom: 40px`

const otp_actions = css`
display: flex;
flex: 1;
align-items: center;
justify-content: space-between;
padding-top: 18px;
`

const otp_instruction = css`
font: ${theme.fonts.regular};
margin: 0;
margin-bottom: 10px;
text-align: left;
`

const btn_link = css`
color: blue;
cursor: pointer;
`

const pin_failure = css`
text-align: right;
margin-top: ${theme.spacing.vertical_row_space_tight};
`
