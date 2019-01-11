import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import { withRouter } from 'react-router-dom'
import { login } from '../actions/Auth'
import { default_theme as theme } from '../theme/default'
import ChangeMobileForm from '../components/form/ChangeMobileForm'
import PageTitle from '../components/PageTitle'

class ChangeMobilePage extends Component {
    
    onFormSubmit = (new_values) => {
        const { dispatch } = this.props
        return dispatch(login(new_values))
    }

    onFormSubmitSuccess = (res) => {
        const { history } = this.props
        if (res.login_method === 'email') {
            history.push(`/account/confirm-otp/${res.username}/${res.login_method}`)
        }
    }

    render() {
        const { email } = this.props
        
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>Change Mobile Number</PageTitle>
                </div>
                <div className={ login_form }>
                  <ChangeMobileForm
                      initialValues={{username: email}}
                      onFormSubmit={this.onFormSubmit}
                      onFormSubmitSuccess={this.onFormSubmitSuccess}
                      email={email}
                  />
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { match } = props
    
    const email = match.params.email
    
    return {
        email
    }
}

export default withRouter(connect(mapStateToProps)(ChangeMobilePage))

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

