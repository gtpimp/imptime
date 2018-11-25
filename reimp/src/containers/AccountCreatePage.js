import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { create_account } from '../actions/Auth'
import PageSubTitle from '../components/PageSubTitle'
import AccountCreateForm from '../components/form/AccountCreateForm'

class AccountCreatePage extends Component {

    onCreateAccount = (values) => {
        const { dispatch } = this.props
        return dispatch(create_account(values))
    }

    onFormSubmitSuccess = () => {
        const { history } = this.props
        history.push('/account/created')
        return
    }
    
    render() {
        
        return (
            <div className="blank-page">
              <div className="blank-container">
                <div className="blank-text">
                  <PageSubTitle>Create a new ImpTime account</PageSubTitle>
                  <AccountCreateForm onFormSubmit={this.onCreateAccount}
                                     onFormSubmitSuccess={this.onFormSubmitSuccess} />
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

export default withRouter(connect(mapStateToProps)(AccountCreatePage)
)
