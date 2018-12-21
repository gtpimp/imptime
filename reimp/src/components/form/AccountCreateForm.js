import React, {Component, Fragment } from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import InputField from './InputField'
import PageParagraph from '../PageParagraph'

const required = value => value ? undefined : 'Required'

class AccountCreateForm extends Component {
    
    render() {
        const { submitting, submit } = this.props
        
        return (
            <Fragment>
              <PageParagraph>
                <Field name="email"
                       type="text"
                       component={InputField}
                       validate={[required]}
                       placeholder="Email" />
              </PageParagraph>
              <button disabled={submitting}
                      onClick={submit}
                      className="button button--large">
                Create
              </button>
            </Fragment>
        )
    }
}

function mapStateToProps() {

    return {
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
    form: 'account_create_form'})(AccountCreateForm))
