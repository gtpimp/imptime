import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import queryString from 'query-string'
import PageTitle from '../components/PageTitle'
import PageParagraph from '../components/PageParagraph'
import { default_theme as theme } from '../theme/default'
import { login } from '../actions/Auth'
import ConfirmOtpLoginForm from '../components/form/ConfirmOtpLoginForm'

class AccountCreatedPage extends Component {
    
    onSubmitOtp = (values) => {
        const { dispatch, username } = this.props
        values.username = username
        return dispatch(login(values))
    }

    render() {
        const { username } = this.props
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>Sign in to ImpTime</PageTitle>
                  <PageParagraph>
                    Please check your email account and enter the code below to continue registration.
                  </PageParagraph>
                  <ConfirmOtpLoginForm email={username} onFormSubmit={this.onSubmitOtp} />
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const query_params = queryString.parse(props.location.search)
    
    return {
        settings: state.settings,
        username: query_params.username
    }
}

export default withRouter(connect(mapStateToProps)(AccountCreatedPage))

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
