import React, { Component } from 'react'
import { connect } from 'react-redux'
import { login } from '../actions/Auth'

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.onSubmitLogin = this.onSubmitLogin.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
    }
    
    onSubmitLogin() {
        const { dispatch } = this.props
        const username = this.usernameInput.value || ""
        const password = this.passwordInput.value || ""
        dispatch(login(username, password))
    }

    onKeyDown(event) {
        if ( event.keyCode === 13 ) {
            this.onSubmitLogin()
        }
    }
    
    render() {

        return (
            <div className="login" onKeyDown={this.onKeyDown}>

                Username:
                <input type="text" name="username" ref={(el) => { this.usernameInput = el }}/>
                <br/>
                
                Password: <input type="password" name="password" ref={(el) => { this.passwordInput = el }}/>
                <br/>
                <button class="btn btn-primary" onClick={this.onSubmitLogin}>Login</button>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default connect(mapStateToProps)(LoginPage)
