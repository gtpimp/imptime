import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { default_theme as theme } from '../theme/default'
import PageTitle from './PageTitle'
import ConfirmOtpLoginForm from '../components/form/ConfirmOtpLoginForm'

class ConfirmOtpLoginPage extends Component {

    onSubmitOtp = () => {
        const { dispatch } = this.props
        //dispatch() otp check api call
    }

    onFormSubmitSuccess = () => {
        const { history } = this.props
        //history.push(`/`) push to new page if otp confirmed
    }

    render() {
        
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>Confirm OTP</PageTitle>
                </div>
                <div className={ login_form }>
                  <ConfirmOtpLoginForm
                      onFormSubmit={this.onSubmitOtp}
                      onFormSubmitSuccess={this.onFormSubmitSuccess}
                  />
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

export default withRouter(connect(mapStateToProps)(ConfirmOtpLoginPage))

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

const login_form = css`
padding: 18px;
`

const link_container = css`
display: flex;
flex: 1;
justify-content: center;
align-items: center;
border-top: 1px solid #e0e0e0;
padding: 18px;
`

const link = css`
font: ${theme.fonts.regular_large};
color: ${theme.colours.list_text};
text-decoration: underline;
`
