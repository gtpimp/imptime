import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import { create_account } from '../actions/Auth'
import InputField from '../components/form/InputField'
import PageParagraph from '../components/PageParagraph'
import PageSubTitle from '../components/PageSubTitle'

const required = value => value ? undefined : 'Required'

class AccountCreateForm extends Component {

    componentDidMount() {
        this.onCreateAccount = this.onCreateAccount.bind(this)
        this.renderField = this.renderField.bind(this)
    }

    onCreateAccount(values) {
        const { dispatch } = this.props
        return dispatch(create_account(values))
    }

    renderField(field) {
        const { input, placeholder, label, type, meta: { touched, error } } = field
        return (
            <div>
              <label>{label}</label>
              <div>
                <InputField {...input} placeholder={placeholder} type={type}/>
                {touched && error && <span>{error}</span>}
              </div>
            </div>
        )
    }
    
    render() {
        const { handleSubmit, submitting } = this.props
        
        return (
            <div className="blank-page">
              <div className="blank-container">
                <div className="blank-text">
                  <PageSubTitle>Create a new ImpTime account</PageSubTitle>
                  <form onSubmit={handleSubmit(this.onCreateAccount)}>
                    <PageParagraph>
                      <Field name="email"
                             type="text"
                             component={this.renderField}
                             validate={[required]}
                             placeholder="Email" />
                    </PageParagraph>
                    <button disabled={submitting}
                            type="submit"
                            className="button button--large">
                      Create
                    </button>
                  </form>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps() {

    return {
    }
}

export default withRouter(connect(mapStateToProps)(reduxForm({
    onFormSubmit: (new_values, dispatch, props) => {
        const { onFormSubmit } = props
        onFormSubmit(new_values)
    },
    onFormSubmitSuccess: (values, dispatch, props) => {
        const { onFormSubmitSuccess } = props
        onFormSubmitSuccess(values)
    },
    form: 'account_create_form'})(AccountCreateForm))
)
