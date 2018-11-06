import React, {Component} from 'react'
import {connect} from 'react-redux'
import { cx, css } from 'emotion'
import {withRouter} from 'react-router-dom'
import queryString from 'query-string'
import { get } from 'lodash'

import { logout } from '../../actions/Auth'
import { default_theme as theme } from '../../theme/default'
import LoginForm from '../form/LoginForm'
import ResponsiveLayout from '../../containers/ResponsiveLayout'
import PageTitle from '../PageTitle'
import PagePrimaryButton from '../PagePrimaryButton'
import OnboardingFooter from './OnboardingFooter'
import OnboardingStep1 from './OnboardingStep1'

class OnboardingWizard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            current_step: 1
        }
    }

    onNextStep = () => {
        const { current_step } = this.state
        this.setState({current_step: current_step + 1})
    }

    onPrevStep = () => {
        const { current_step } = this.state
        this.setState({current_step: current_step -1})
    }

    onComplete = () => {
        const { dispatch, history } = this.props
        history.push('/')
    }

    onLogout = () => {
        const { dispatch, history } = this.props
        dispatch(logout())
        history.push('/')
    }

    render() {
        const { current_step } = this.state
        return (
            <div className={ box }>
              <div className={ header }>
                <PageTitle>Account Setup</PageTitle>
              </div>
              <div className={ content }>
                { current_step === 1 &&
                  <OnboardingStep1 />
                }
                { current_step === 2 &&
                  <p>Step 2</p>
                }
                { current_step === 3 &&
                  <p>Step 3</p>
                }
                { current_step === 4 &&
                  <p>Step 4</p>
                }
              </div>
              <OnboardingFooter
                  current_step={ current_step }
                  onLogout={ this.onLogout }
                  onNextStep={ this.onNextStep }
                  onPrevStep={ this.onPrevStep }
                  onComplete={ this.onComplete } />
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    return {
        
    }
}
export default withRouter(connect(mapStateToProps)(OnboardingWizard))

const box = css`
width: 400px;
background-color: #FFFFFF;
box-shadow: 0 4px 12px 0 rgba(0,0,0,0.3);
border-radius: 2px;
min-height: 400px;
position: relative;

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

const content = css`
display: flex;
padding: 18px;
flex-direction: column;
`
