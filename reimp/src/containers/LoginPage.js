import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import cookie from 'react-cookies'
import { SubmissionError } from 'redux-form'
import {withRouter} from 'react-router-dom'
import queryString from 'query-string'
import { get } from 'lodash'

import { login, isValidEmail, sendOtpEmail } from '../actions/Auth'
import { default_theme as theme } from '../theme/default'
import LoginForm from '../components/form/LoginForm'
import PageTitle from '../components/PageTitle'

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.state = { preferred_login_method: undefined }
    }
   

    compenentDidMount() {
        const preferred_login_method = cookie.load('preferred_login_method')
        this.setState({preferred_login_method: preferred_login_method})
    }

    onLoginFormSubmit = (new_values) => {
        
        const login_method = new_values.login_method
        const request_mobile_change = new_values.request_mobile_change
        
        if (login_method === 'password') {
            return this.onLogin(new_values)
        } else if (login_method === 'email') {
            return this.onSendOtpEmail(new_values)
        } else if (login_method === 'sms' && !request_mobile_change) {
            return this.onSendOtpTextMessage(new_values)
        } else if (login_method === 'sms' && request_mobile_change) {
            return this.onRequestMobileChangeByOtp(new_values)
        }
    }

    onLogin = (values) => {
        const { dispatch } = this.props
        return dispatch(login(values))
    }

    onClickedCreateAccount = (evt) => {
        const { history } = this.props
        if (evt) {
            evt.preventDefault()
        }
        history.push('/account/create')
    }
    
    onSendOtpTextMessage = (values) => {
        console.log(values)
    }

    onRequestMobileChangeByOtp(values) {
        return this.onSendOtpEmail(values)
    }
    
    async onSendOtpEmail(values) {
        const { dispatch } = this.props
        if (!isValidEmail(values.username)) {
            throw new SubmissionError({ _error: 'Invalid email' })
        }
        return await dispatch(sendOtpEmail(values))
    }

    onFormSubmitSuccess = (res) => {
        const { history } = this.props
        console.log(res)
        if (res.login_method === 'email') {
            history.push(`/account/confirm-otp/${res.username}/${res.login_method}`)
        } else if (res.login_method === 'sms' && res.request_mobile_change) {
            history.push(`/account/change-mobile-by-otp/${res.username}`)
        }
    }

    render() {
        const { initialValues } = this.props
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>Sign in to ImpTime</PageTitle>
                </div>
                <div className={ login_form }>
                  <LoginForm
                      initialValues={ {...initialValues, login_method: this.state.preferred_login_method }}
                      onFormSubmit={this.onLoginFormSubmit}
                      onFormSubmitSuccess={this.onFormSubmitSuccess}
                  />
                </div>
                <div className={ link_container }>
                  <a href="/"
                     className={ link }
                     onClick={this.onClickedCreateAccount}>
                    Create an account
                  </a>
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const query_params = queryString.parse(props.location.search)
    
    return {
        initialValues: {
            username: get(query_params, 'u', '')
        }
    }
}

export default withRouter(connect(mapStateToProps)(LoginPage))

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
