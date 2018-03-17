import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
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
        return dispatch(change_password(values.old_password, values.new_password))
    }
    
    render() {
        const that = this
        const { handleSubmit, error_msg, submitting } = this.props
        
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Change Password</div>
                        <div className="login__body">
                          <form onSubmit={handleSubmit(this.onChangePassword)}>
                                <Field name="old_password" type="password" placeholder="Existing Password" component="input" />
                                <Field name="new_password" type="password" placeholder="New Password" component="input" />
                                { error_msg &&
                                  <div className="login-form__message">
                                      <Message variant="error">{error_msg}</Message>
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
        settings: state.settings,
        error_msg: getChangeUserPasswordError(state)
    }
}

export default connect(mapStateToProps)(reduxForm({form:'change_password_page'})(ChangePasswordPage))
