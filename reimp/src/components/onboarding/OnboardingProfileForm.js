import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import InputField from '../form/InputField'
import PageParagraph from '../PageParagraph'

class OnboardingProfileForm extends Component {

    renderFirstNameInput(field) {
        const {input} = field
        return <InputField maxLength="300"
                           placeholder="First name"
                           onChange={input.onChange}
                           value={input.value}
               />
    }

    renderLastNameInput(field) {
        const {input} = field
        return <InputField maxLength="300"
                           placeholder="Last name"
                           onChange={input.onChange}
                           value={input.value}
               />
    }
    
    render() {
        const { handleSubmit } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <PageParagraph>
                  <Field name="first_name" component={this.renderFirstNameInput} />
                </PageParagraph>
                <PageParagraph>
                  <Field name="last_name" component={this.renderLastNameInput} />
                </PageParagraph>
                <PageParagraph>
                  <button className="button issue_sidebar--textarea" type="submit">Create</button>
                </PageParagraph>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onSubmit, onCancel } = props
    
    return {
        onSubmit,
        onCancel,
        enableReinitialize: true,
    }
}


export default connect(mapStateToProps)(reduxForm({form:'onboarding_profile_form'})(OnboardingProfileForm))
