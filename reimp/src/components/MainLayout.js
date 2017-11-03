import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import Header from '../components/Header'
import ModalDialog from '../components/ModalDialog'
import Websocket from '../components/Websocket'
import LoginPage from '../containers/LoginPage'
import { DragDropContext } from 'react-dnd';
import { logged_in_user, is_authenticated, auto_login } from '../actions/Auth'
import { updateSettings, isConfigured } from '../actions/Settings'
import { ensureUsersLoaded } from '../actions/Users'
var HTML5Backend = require('react-dnd-html5-backend');

class MainLayout extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        const that = this

        /* window.onerror = function(msg, url, line, col, error) {
         *     alert("whoops")
         * }*/

        dispatch(updateSettings(window.LOCAL_SETTINGS))
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.logged_in_user_id && new_props.logged_in_user_id !== this.props.logged_in_user_id ) {
            this.refresh(new_props)
        }
    }

    refresh(props) {
        const { dispatch, location, logged_in_user_id, settings,
                has_usable_password } = props
        dispatch(ensureUsersLoaded([logged_in_user_id]))
        
        if ( logged_in_user_id ) {
            dispatch(ensureUsersLoaded([logged_in_user_id]))
            if ( has_usable_password === "false" ) {
                browserHistory.push('/password/change')
            }
        } else {
            if ( settings.configured && location.query.autologin !== undefined ) {
                dispatch(auto_login(location.query.autologin))
            }
        }
    }

    render() {
        const { has_error, error_message, is_logged_in, are_settings_loaded } = this.props

        const allow_non_auth = this.props.location.pathname.indexOf('password/forgot') != -1 ||
                               this.props.location.pathname.indexOf('password/reminded') != -1
        
        if ( ! are_settings_loaded ) {
            return (
                <div>Loading settings...</div>
            )
        }

        if ( ! is_logged_in && ! allow_non_auth  ) {
            return (
                <div className="app app--login">
                    <LoginPage />
                </div>
            )
        }
        
        return (
            <div className="app">
                <Websocket/>
                <Header/>
                <div className="main">
                {this.props.children}
                </div>
                <ModalDialog isOpen={has_error} title="Imp Down">
                    <div>{error_message}</div>
                    <button className="button button--default button--large">Reload</button>
                </ModalDialog>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { configured } = isConfigured(state)
    const user = logged_in_user()
    const logged_in_user_id = user['user_id'] || null
    const has_usable_password = user['has_usable_password'] || false
    const notification_bar = state.notification_bar || {}
    const error_message = notification_bar.error_message
    
    return {
        has_error: error_message && error_message.length && error_message.length > 0,
        error_message: error_message,
        is_logged_in: is_authenticated(),
        are_settings_loaded: configured,
        logged_in_user_id: logged_in_user_id,
        has_usable_password: has_usable_password,
        settings: state.settings
    }
}

export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(MainLayout))
