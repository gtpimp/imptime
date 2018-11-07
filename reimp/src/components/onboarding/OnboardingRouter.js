import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
import OnboardingStepWelcome from './OnboardingStepWelcome'
import OnboardingStepUserDetails from './OnboardingStepUserDetails'
import OnboardingStepPassword from './OnboardingStepPassword'
import OnboardingStepBeta from './OnboardingStepBeta'

class OnboardingRouter extends Component {

    render() {

        const { match } = this.props
        
        return (
            <Switch>
              <Route exact path={match.path} component={OnboardingStepWelcome}/>
              <Route exact path={`${match.path}/1`} component={OnboardingStepWelcome}/>
              <Route exact path={`${match.path}/2`} component={OnboardingStepUserDetails}/>
              <Route exact path={`${match.path}/3`} component={OnboardingStepPassword}/>
              <Route exact path={`${match.path}/4`} component={OnboardingStepBeta}/>
            </Switch>
        )
    }
    
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(OnboardingRouter))
