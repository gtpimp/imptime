import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { logged_in_user } from '../actions/Auth'
import { change_password, requestingNewUserPassword, getChangeUserPasswordError } from '../actions/Auth'
import { ensureUsersLoaded, getUser } from '../actions/Users'
import { Field, reduxForm } from 'redux-form'
import Message from '../components/Message'

class ChangePasswordPage extends Component {

    constructor(props) {
        super(props)
        this.onChangePassword = this.onChangePassword.bind(this)
    }

    componentDidMount() {
        const { dispatch, user_id } = this.props
        if ( user_id ) {
            dispatch(ensureUsersLoaded([user_id]))
        }
        dispatch(requestingNewUserPassword())
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, user_id } = new_props
        if ( user_id ) {
            dispatch(ensureUsersLoaded([user_id]))
        }
    }

    onChangePassword(values) {
        const { dispatch } = this.props
        return dispatch(change_password(values))
    }
    
    render() {
        const { handleSubmit, error_msg, submitting, has_usable_password } = this.props
        
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-form" >
                        <div className="login__header">Update user details</div>
                        <div className="login__body">
                          <form onSubmit={handleSubmit(this.onChangePassword)}>
                            <Field name="first_name" placeholder="First name" component="input" />
                            <Field name="last_name" placeholder="Last name" component="input" />
                            { has_usable_password &&
                              <Field name="old_password" type="password" placeholder="Existing Password" component="input" />
                            }
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

    let user = logged_in_user()
    const has_usable_password = user.has_usable_password !== false && user.has_usable_password !== "false"
    const user_id = user.user_id
    if ( user_id ) {
        user = Object.assign({}, user, getUser(state, user_id))
    }
     
    return {
        user_id,
        enableReinitialize: true,
        initialValues: {first_name: user.first_name,
                        last_name: user.last_name},
        settings: state.settings,
        error_msg: getChangeUserPasswordError(state),
        has_usable_password: has_usable_password,
    }
}

export default withRouter(connect(mapStateToProps)(reduxForm({form:'change_password_page'})(ChangePasswordPage)))
