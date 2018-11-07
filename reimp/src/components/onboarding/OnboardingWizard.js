import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'

import { logout, onboarding_complete } from '../../actions/Auth'
import { default_theme as theme } from '../../theme/default'
import PageTitle from '../PageTitle'
import OnboardingFooter from './OnboardingFooter'

class OnboardingWizard extends Component {

    onNextStep = () => {
        const { dispatch, history, next_step, onNextHook } = this.props
        const gotoNextPage = () => history.push(`/onboarding/${next_step}`)
        if ( next_step ) {
            if ( onNextHook ) {
                onNextHook(gotoNextPage)
            } else {
                gotoNextPage()
            }
        } else {
            dispatch(onboarding_complete(this.onComplete))
        }
    }

    onPrevStep = () => {
        const { history, prev_step } = this.props
        if ( prev_step ) {
            history.push(`/onboarding/${prev_step}`)
        }
    }

    onComplete = () => {
        const { history } = this.props
        history.push('/')
    }

    onLogout = () => {
        const { dispatch, history } = this.props
        dispatch(logout())
        history.push('/')
    }

    render() {
        const { children, current_step, next_step, next_step_label, prev_step } = this.props
        return (
            <div className={ box }>
              <div className={ header }>
                <PageTitle>Account Setup</PageTitle>
              </div>
              <div className={ content }>
                {children}
              </div>
              <OnboardingFooter
                  current_step={ current_step }
                  onLogout={ this.onLogout }
                  onNextStep={ next_step && this.onNextStep }
                  next_step_label={ next_step_label }
                  onPrevStep={ prev_step && this.onPrevStep }
                  onComplete={ this.onComplete } />
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    const { current_step, next_step, prev_step, next_step_label, onNextHook } = props
    return {
        current_step,
        next_step,
        next_step_label,
        prev_step,
        onNextHook
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
