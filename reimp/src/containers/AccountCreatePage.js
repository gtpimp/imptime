import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { Field, reduxForm } from 'redux-form'
import { create_account } from '../actions/Auth'
import InputField from '../components/form/InputField'
import PageParagraph from '../components/PageParagraph'
import PageSubTitle from '../components/PageSubTitle'

const required = value => value ? undefined : 'Required'
 
class AccountCreatePage extends Component {

    componentDidMount() {
        this.onCreateAccount = this.onCreateAccount.bind(this)
        this.onFormSubmitSuccess = this.onFormSubmitSuccess.bind(this)
    }

    onCreateAccount(values) {
        const { dispatch } = this.props
        return dispatch(create_account(values))
    }

    onFormSubmitSuccess() {
        const { history } = this.props
        history.push('/account/created')
    }

    /* render() {
     *     
     *     return (
     *         <div className="blank-page">
     *           <div className="blank-container">
     *             <div className="blank-text">
     *               <PageSubTitle>Create a new ImpTime account</PageSubTitle>
     *               <AccountCreateForm onFormSubmit={this.onCreateAccount}
     *                                  onFormSubmitSuccess={this.onFormSubmitSuccess}
     *               />
     *             </div>
     *           </div>
     *         </div>
     *     )
     * }*/
    
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
                             component={InputField}
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

export default withRouter(connect(mapStateToProps)(reduxForm({form: 'account_create_page'})(AccountCreatePage))
)
