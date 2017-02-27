import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import {login} from '../../actions/Auth'
import Message from '../../components/Message'

class LoginForm extends Component {

    render() {

        const { handleSubmit } = this.props
        
        return (
            <div className="login-form" >
                <div className="login__header">Log In</div>
                <div className="login__body">
                    <form onSubmit={handleSubmit}>
                        <Field name="username" placeholder="Email Address" component="input" />
                        <Field name="password" placeholder="Password" component="input" />
                        <div className="login-form__message">
                            <Message variant="error">Invalid username/password combination (@Gareth to wire up)</Message>
                        </div>
                        <button type="submit" className="button button--large button--login">Log In</button>
                        <div className="login__forgot-password-link">forgot password?</div>
                    </form>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onLogin } = props
    
    return {
        onSubmit: onLogin
    }
}

export default connect(mapStateToProps)(reduxForm({form:'login_form'})(LoginForm))
