import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { css } from 'emotion'
import { create_account } from '../actions/Auth'
import PageTitle from '../components/PageTitle'
import AccountCreateForm from '../components/form/AccountCreateForm'
import { default_theme as theme } from '../theme/default'

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
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>Create a new ImpTime account</PageTitle>
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

export default withRouter(connect(mapStateToProps)(AccountCreatePage))

const main = css`
display: flex;
justify-content: center;
padding-top: 50px;

@media (max-width: ${theme.breakpoints.mobile}) {
    padding-top: 0;
    justify-content: flex-start;
}
`

const box = css`
width: 400px;
background-color: #FFFFFF;
box-shadow: 0 4px 12px 0 rgba(0,0,0,0.3);
border-radius: 2px;

@media (max-width: ${theme.breakpoints.mobile}) {
    width: 100%;
    height: 100%;
    box-shadow: none;
    border-radius: 0;
    border: none;
    position: absolute;
    left: 0;
    top: 0;
}
`

const header = css`
border-bottom: 1px solid #e0e0e0;
padding: 18px;
`
