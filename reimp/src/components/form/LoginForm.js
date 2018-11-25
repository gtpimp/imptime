import React, {Component, Fragment } from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import {withRouter} from 'react-router-dom'
import CardDynamicDropdownField from '../CardDynamicDropdownField'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import InputField from './InputField'

const FORM_NAME = 'login_page'
const valueSelector = formValueSelector(FORM_NAME)
const required = value => (value ? undefined : 'Required')

class LoginForm extends Component {

    constructor(props) {
        super(props)
        this.login_options = [
            {value: 'password', label: 'Enter password'},
            {value: 'email', label: 'Send one time password via email'},
            {value: 'text', label: 'Send one time password via text'}
        ]
    }
    
    renderPasswordInput() {
        const { login_method } = this.props

        if (login_method === 'password') {
            return (
                <div className={inputFieldDiv}>
                  <Field
                      name="password"
                      type="password"
                      validate={[required]}
                      placeholder="Password"
                      component={ InputField } />
                </div>
            )
        }
    }

    renderButtons() {
        const { submit, login_method, submitting } = this.props
        
        return (
            <div className={ form_actions }>
              { login_method === 'password' &&
                <PagePrimaryButton
                    label="SIGN IN"
                    onButtonClick={submit}
                    disabled={submitting} />
              }
              { (login_method === "email" ||
                 login_method === "text") &&
                <PagePrimaryButton
                    label="GET ONE TIME PASSWORD"
                    onButtonClick={submit}
                    disabled={submitting} />
              }
            </div>
        )
    }

    renderLoginMethod() {
        return (
            <Fragment>
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
            </Fragment>
        )
    }

    render() {
        const { error } = this.props

        return (
            <Fragment>
              { this.renderLoginMethod() }
              { this.renderPasswordInput() }
              { this.renderButtons() }
              { error &&
              <div className="login-form__message">
                <Message variant="error">{ error && error }</Message>
              </div>
              }
            </Fragment>
        )
    }
}
function mapStateToProps(state) {
    return {
        settings: state.settings,        
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
