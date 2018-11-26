import React, {Component, Fragment } from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import { Field, reduxForm } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import InputField from './InputField'

const FORM_NAME = 'change_mobile_form'
const required = value => (value ? undefined : 'Required')

class ChangeMobileForm extends Component {

    render() {
        const { error, email, submit, submitting } = this.props
        
        return (
            <form>
              <div className={inputFieldDiv}>
                <Field
                    name="mobile_phone_number"
                    type="text"
                    validate={[required]}
                    placeholder="Mobile number"
                    component={ InputField } />
              </div>
              <div className="login-form__message">
                { `We've sent a one time pin to ${email}.`}
              </div>
              <div className="login-form__message">
                I didn't recieve my pin
              </div>
              <div className={inputFieldDiv}>
                <Field
                    name="password"
                    type="text"
                    validate={[required]}
                    placeholder="One time pin"
                    component={ InputField } />
              </div>
              <div className={ form_actions }>
                <PagePrimaryButton
                    label="SUBMIT"
                    onButtonClick={submit}
                    disabled={submitting} />
              </div>
              { error &&
                <div className="login-form__message">
                  <Message variant="error">{ error && error }</Message>
                </div>
              }
            </form>
        )
    }
}
function mapStateToProps(state, props) {
    
    return {
        settings: state.settings,
    }
}

export default connect(mapStateToProps)(reduxForm({
    onSubmit: (new_values, dispatch, props) => {
        const { onFormSubmit } = props
        return onFormSubmit(new_values)
    },
    onSubmitSuccess: (res, dispatch, props) => {
        const { onFormSubmitSuccess } = props
        return onFormSubmitSuccess(res)
    },
    form: FORM_NAME })(ChangeMobileForm))

const inputFieldDiv = css`margin-bottom: 40px`

const form_actions = css`
margin-bottom: 34px;
display:flex;
justify-content: space-between;
`
