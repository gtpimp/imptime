import React, { Component, Fragment} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import InputField from '../form/InputField'
import PageParagraph from '../PageParagraph'

class OnboardingProfileForm extends Component {
    
    render() {

        return (
            <Fragment>
              <PageParagraph>
                <Field name="first_name"
                       component={InputField}
                       placeholder="First name"
                
                />
              </PageParagraph>
              <PageParagraph>
                <Field name="last_name"
                       component={InputField}
                       placeholder="Last name"
                />
              </PageParagraph>
            </Fragment>
        )
    }
}

function mapStateToProps() {

    return {
        enableReinitialize: true,
    }
}

export default connect(mapStateToProps)(reduxForm({
    onSubmit: (new_values, dispatch, props) => {
        const { onFormSubmit } = props
        return onFormSubmit(new_values)
    },
    onSubmitSuccess: (values, dispatch, props) => {
        const { onFormSubmitSuccess } = props
        return onFormSubmitSuccess(values)
    },
    form: 'onboarding_profile_form'}) (OnboardingProfileForm))
