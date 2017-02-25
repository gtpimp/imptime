import React, {Component} from 'react'
import {connect} from 'react-redux'
import {login} from '../actions/Auth'
import Message from '../components/Message'

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.onSubmitLogin = this.onSubmitLogin.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    onSubmitLogin() {
        const {dispatch} = this.props
        const username = this.usernameInput.value || ""
        const password = this.passwordInput.value || ""
        dispatch(login(username, password))
    }

    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.onSubmitLogin()
        }
    }

    render() {

        return (
            <div className="login-page">
                <div className="login-page__header">
                    <div className="login-page__logo"></div>
                    <div className="login-page__title">Log In</div>
                </div>

                <div className="login-container">

                    <div className="login-form" onKeyDown={this.onKeyDown}>
                        <div className="login__header">Log In</div>
                        <div className="login__body">
                            <input type="email" placeholder="Email Address" name="username" ref={(el) => {
                                this.usernameInput = el
                            }}/>

                            <input type="password" name="password" placeholder="Password" ref={(el) => {
                                this.passwordInput = el
                            }}/>
                            <div className="login-form__message">
                                <Message variant="error">Invalid username/password combination (@Gareth to wire up)</Message>
                            </div>
                            <button className="button button--large button--login" onClick={this.onSubmitLogin}>Log In</button>
                            <div className="login__forgot-password-link">forgot password?</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(LoginPage)
