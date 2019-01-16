import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
import LoginPage from '../containers/LoginPage'
import ConfirmOtpLoginPage from '../components/ConfirmOtpLoginPage'
import ChangeMobilePage from './ChangeMobilePage'
import PinSendFailureReasons from '../components/PinSendFailureReasons'
import { setBrowserTitle } from '../actions/Page'

class NonAuthRouter extends Component {

    render() {
        
        setBrowserTitle('ImpTime')
        
        return (
            <Switch>
              <Route exact path="/account/confirm-otp/:username/:login_method" component={ConfirmOtpLoginPage}/>
              <Route exact path="/account/change-mobile-by-otp/:email" component={ChangeMobilePage}/>
              <Route exact path="/account/pin-failure/:email" component={PinSendFailureReasons}/>
              <Route path="/" component={LoginPage}/>
            </Switch>
        )
    }
}

function mapStateToProps() {
    return {}
}

export default withRouter(connect(mapStateToProps)(NonAuthRouter))
