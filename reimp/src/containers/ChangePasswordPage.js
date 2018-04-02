import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { logged_in_user } from '../actions/Auth'
import { change_password, requestingNewUserPassword, getChangeUserPasswordError } from '../actions/Auth'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class ChangePasswordPage extends Component {

    constructor(props) {
        super(props)
        this.onChangePassword = this.onChangePassword.bind(this)
    }

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(requestingNewUserPassword())
    }

    onChangePassword(values) {
        const { dispatch, settings } = this.props
        return dispatch(change_password(values))
    }
    
    render() {
        const that = this
        const { handleSubmit, error_msg, submitting, has_usable_password } = this.props
        
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Change Password</div>
                        <div className="login__body">
                          <form onSubmit={handleSubmit(this.onChangePassword)}>
                            { has_usable_password &&
                              <Field name="old_password" type="password" placeholder="Existing Password" component="input" />
                            }
                            <Field name="new_password" type="password" placeholder="New Password" component="input" />
                            { error_msg &&
                              <div className="login-form__message">
                                <Message variant="error">{error_msg}</Message>
                              </div>
                            }
                            <Field name="first_name" placeholder="First name" component="input" />
                            <Field name="last_name" placeholder="Last name" component="input" />
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

    const user = logged_in_user()
    const has_usable_password = user.has_usable_password !== false && user.has_usable_password !== "false"
    
    return {
        enableReinitialize: true,
        initialValues: {first_name: user.first_name,
                        last_name: user.last_name},
        settings: state.settings,
        error_msg: getChangeUserPasswordError(state),
        has_usable_password: has_usable_password,
    }
}

export default connect(mapStateToProps)(reduxForm({form:'change_password_page'})(withRouter(ChangePasswordPage)))
