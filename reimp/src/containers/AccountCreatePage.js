import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { create_account } from '../actions/Auth'
import {
    set_toolbars,
} from '../actions/Page'

class AccountCreatePage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
        this.onCreateAccount = this.onCreateAccount.bind(this)
    }

    onCreateAccount(values) {
        const { dispatch } = this.props
        return dispatch(create_account(values))
    }
    
    render() {
        const { handleSubmit, error, submitting } = this.props
        
        return (
            <div className="blank-page">
              <div className="blank-page__header">
                <div className="blank-page__logo"></div>
                <div className="blank-page__title">New account</div>
              </div>
              <div className="blank-container">
                <div className="blank-text">
                  <h2>New ImpTime account</h2>
                  <form onSubmit={handleSubmit(this.onCreateAccount)}>
                    <div className="blank-page__line">
                      <Field name="email" type="text" placeholder="Email" component="input" />
                    </div>
                    <div className="blank-page__line">
                      <Field name="first_name" type="text" placeholder="First name" component="input" />
                    </div>
                    <div className="blank-page__line">
                      <Field name="last_name" type="text" placeholder="Last name" component="input" />
                    </div>
                    <button disabled={submitting} type="submit" className="button button--large">Create</button>
                  </form>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default connect(mapStateToProps)(reduxForm({form:'account_create_page'})(AccountCreatePage))
