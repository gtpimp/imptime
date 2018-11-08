import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import InputField from '../form/InputField'
import PageParagraph from '../PageParagraph'

class OnboardingPasswordForm extends Component {

    constructor(props) {
        super(props)
        this.state = {'show_phone_number_section': false,
                      'already_toggled_show_phone_number_section': false}
    }

    componentDidMount() {
        const { initially_show_mobile_phone_number_section } = this.props
        if ( initially_show_mobile_phone_number_section ) {
            this.setState({'show_phone_number_section': true,
                           'already_toggled_show_phone_number_section': true})
        }
    }

    componentWillReceiveProps(new_props) {
        const { initially_show_mobile_phone_number_section } = new_props
        const { show_phone_number_section, already_toggled_show_phone_number_section } = this.state
        if ( !already_toggled_show_phone_number_section && ! show_phone_number_section && initially_show_mobile_phone_number_section ) {
            this.setState({'show_phone_number_section': true,
                           'already_toggled_show_phone_number_section': true})
        }
    }

    onToggleShowPhoneNumberSection = (e, fieldOnChange) => {
        const { show_phone_number_section } = this.state
        this.setState({show_phone_number_section: !show_phone_number_section,
                       already_toggled_show_phone_number_section: true})
        fieldOnChange(e)
    }

    renderEnablePhoneNumberPinInput = (field) => {
        const {input} = field
        return (
            <label>
              <input type="checkbox"
                     label="Enable sign-in through mobile"
                     checked={input.value}
                     onChange={(e) => this.onToggleShowPhoneNumberSection(e, input.onChange)} />
              Enable sign-in through mobile
            </label>
        )
    }
    
    renderPasswordInput(field) {
        const {input} = field
        return <InputField maxLength="300"
                           placeholder="Password"
                           type="password"
                           onChange={input.onChange}
                           value={input.value}
               />
    }

    renderPhoneNumberInput(field) {
        const {input} = field
        return <InputField maxLength="300"
                           placeholder="Mobile phone number"
                           onChange={input.onChange}
                           value={input.value}
               />
    }
    
    render() {
        const { handleSubmit } = this.props
        const { show_phone_number_section } = this.state
        
        return (
            <form onSubmit={handleSubmit}>
              <PageParagraph>
                <p>
                  Choose a password:
                  <Field name="new_password"
                         type="password"
                         component={this.renderPasswordInput} />
                </p>
              </PageParagraph>

              <Field name="enable_mobile_phone_number_pin"
                     component={this.renderEnablePhoneNumberPinInput} />
              { show_phone_number_section && 
                <PageParagraph>
                  Enter the phone number where you would like to receive your one time pins.
                  
                  <Field name="mobile_phone_number"
                         component={this.renderPhoneNumberInput} />
                  
                  (this number will not be used for any other purpose)
                </PageParagraph>
              }
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmit, initially_show_mobile_phone_number_section } = props
    
    return {
        onSubmit,
        initially_show_mobile_phone_number_section,
        enableReinitialize: true,
    }
}


export default connect(mapStateToProps)(reduxForm({form:'onboarding_password_form'})(OnboardingPasswordForm))
