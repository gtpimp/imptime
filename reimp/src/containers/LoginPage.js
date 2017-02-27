import React, {Component} from 'react'
import {connect} from 'react-redux'
import {login} from '../actions/Auth'
import Message from '../components/Message'
import LoginForm from '../components/form/LoginForm'

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.onLogin = this.onLogin.bind(this)
    }

    onLogin(values) {
        const { dispatch } = this.props
        dispatch(login(values.username, values.password))
    }
    
    render() {

        const that = this
        
        return (
            <div className="login-page">
                <div className="login-page__header">
                    <div className="login-page__logo"></div>
                    <div className="login-page__title">Log In</div>
                </div>

                <div className="login-container">
                    <LoginForm onLogin={that.onLogin} />
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default connect(mapStateToProps)(LoginPage)
