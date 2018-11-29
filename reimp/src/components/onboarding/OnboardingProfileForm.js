import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import InputField from '../form/InputField'
import PageParagraph from '../PageParagraph'

class OnboardingProfileForm extends Component {
    
    render() {
        const { handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
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
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmit } = props
    
    return {
        onSubmit,
        enableReinitialize: true,
    }
}


export default connect(mapStateToProps)(reduxForm({form:'onboarding_profile_form'})(OnboardingProfileForm))
