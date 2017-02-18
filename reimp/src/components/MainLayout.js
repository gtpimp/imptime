import React, {Component} from 'react'
import {connect} from 'react-redux'
import Header from '../components/Header'
import ModalDialog from '../components/ModalDialog'
import Websocket from '../components/Websocket'
import LoginPage from '../containers/LoginPage'
import { DragDropContext } from 'react-dnd';
var HTML5Backend = require('react-dnd-html5-backend');
import { logged_in_user, is_authenticated } from '../actions/Auth'
import { updateSettings } from '../actions/Settings'
import { ensureUsersLoaded } from '../actions/Users'
import Modal from 'react-modal';

class MainLayout extends Component {

    componentDidMount() {
        const { dispatch, logged_in_user_id } = this.props

        window.onerror = function(msg, url, line, col, error) {
            //alert("whoops")
        }

        require.ensure(['../external_config/react_local_settings'], function() {
            let local_settings = require('../external_config/react_local_settings')
            dispatch(updateSettings(local_settings.local_settings))

            if ( logged_in_user_id ) {
                dispatch(ensureUsersLoaded([logged_in_user_id]))
            }
        })
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        if ( new_props.logged_in_user_id && new_props.logged_in_user_id !== this.props.logged_in_user_id ) {
            dispatch(ensureUsersLoaded([new_props.logged_in_user_id]))
        }
    }

    render() {
        const { error_message, is_logged_in, are_settings_loaded } = this.props

        if ( ! are_settings_loaded ) {
            return (
                <div>Loading settings...</div>
            )
        }

        if ( ! is_logged_in ) {
            return (
                <div className="app">
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
                <ModalDialog isOpen={error_message} title="Imp Down">
                    <div>{error_message}</div>
                    <button className="button button--default button--large">Reload</button>
                </ModalDialog>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { configured } = state.settings
    const logged_in_user_id = logged_in_user()['user_id'] || null
    const notification_bar = state.notification_bar || {}
    
    return {
        error_message: notification_bar.error_message,
        is_logged_in: is_authenticated(),
        are_settings_loaded: configured,
        logged_in_user_id: logged_in_user_id
    }
}

export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(MainLayout))
