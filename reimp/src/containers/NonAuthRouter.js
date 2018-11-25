import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Route, Switch, withRouter } from 'react-router-dom'
import LoginPage from '../containers/LoginPage'
import ConfirmOtpLoginPage from '../components/ConfirmOtpLoginPage'
import { setBrowserTitle } from '../actions/Page'

class NonAuthRouter extends Component {

    render() {
        
        setBrowserTitle('ImpTime')
        
        return (
            <Switch>
              <Route exact path="/" component={LoginPage}/>
              <Route exact path="/account/confirm-otp/:username/:login_method" component={ConfirmOtpLoginPage}/>
            </Switch>
        )
    }
}

function mapStateToProps() {
    return {}
}

export default withRouter(connect(mapStateToProps)(NonAuthRouter))
