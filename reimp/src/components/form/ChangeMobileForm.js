import React, {Component } from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'
import { Field, reduxForm } from 'redux-form'
import Message from '../../components/Message'
import PagePrimaryButton from '../../components/PagePrimaryButton'
import PinSendFailureReasons from '../PinSendFailureReasons'
import { sendOtpEmail } from '../../actions/Auth'
import ModalDialog from '../ModalDialog'
import InputField from './InputField'

const FORM_NAME = 'change_mobile_form'
const required = value => (value ? undefined : 'Required')

class ChangeMobileForm extends Component {

    constructor(props) {
        super(props)
        this.state = { is_pin_error_reasons_open: false }
    }

    render() {
        const { error, email, dispatch, submit, submitting } = this.props

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
                { `We've sent a one time pin to ${email}`}
              </div>
              <div className="login-form__message">
                <a className={ link }
                   onClick={() => this.setState({ is_pin_error_reasons_open: true })}>
                  I didn't recieve my pin
                </a>
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
                <a className={ link }
                   disabled={submitting}
                   onClick={() => dispatch(sendOtpEmail({username: email}))}>
                  I didn't recieve my pin
                </a>
              </div>
              { error &&
                <div className="login-form__message">
                  <Message variant="error">{ error && error }</Message>
                </div>
              }
              <ModalDialog isOpen={this.state.is_pin_error_reasons_open}
                           onClose={() => this.setState({ is_pin_error_reasons_open: false })}>
                <PinSendFailureReasons email={email}/>
              </ModalDialog>
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
align-items: center;
`
const link = css`
font: ${theme.fonts.regular_large};
color: ${theme.colours.list_text};
text-decoration: none;
cursor: pointer;
`
