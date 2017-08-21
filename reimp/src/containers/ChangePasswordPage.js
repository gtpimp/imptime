import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { change_password } from '../actions/Auth'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class ChangePasswordPage extends Component {

    constructor(props) {
        super(props)
        this.onChangePassword = this.onChangePassword.bind(this)
    }

    onChangePassword(values) {
        const { dispatch, settings } = this.props
        return dispatch(change_password(values.password))
    }
    
    render() {
        const that = this
        const { handleSubmit, error, submitting } = this.props
        
        return (
            <div className="login-page">
                <div className="login-page__header">
                    <div className="login-page__logo"></div>
                    <div className="login-page__title">Change Password</div>
                </div>

                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Change Password</div>
                        <div className="login__body">
                            <form onSubmit={handleSubmit(this.onChangePassword)}>
                                <Field name="password" type="password" placeholder="New Password" component="input" />
                                { error &&
                                  <div className="login-form__message">
                                      <Message variant="error">Invalid password</Message>
                                  </div>
                                }
                                <button disabled={submitting} type="submit" className="button button--large button--login">Save</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
        settings: state.settings
    }
}

export default connect(mapStateToProps)(reduxForm({form:'change_password_page'})(ChangePasswordPage))
