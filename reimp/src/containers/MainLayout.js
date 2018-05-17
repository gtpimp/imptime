import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Websocket from '../components/Websocket'
import LoginPage from '../containers/LoginPage'
import { parse } from 'query-string'
import { DragDropContext } from 'react-dnd';
import { logged_in_user, is_authenticated, auto_login } from '../actions/Auth'
import { updateSettings, isConfigured } from '../actions/Settings'
import { ensureUsersLoaded } from '../actions/Users'
import AutoClockPopup from '../components/auto_clock/AutoClockPopup'
import ReactTooltip from 'react-tooltip'
import Error from '../components/Error'
import Maintenance from '../components/Maintenance'
import GlobalCommentAnnotation from '../components/GlobalCommentAnnotation'
import MainRouter from './MainRouter'
import { ShortcutManager } from 'react-shortcuts'
import keymap from '../actions/Keymap'
var HTML5Backend = require('react-dnd-html5-backend');
const shortcut_manager = new ShortcutManager(keymap)


class MainLayout extends Component {
    
    getChildContext() {
        return { shortcuts: shortcut_manager }
    }
    
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(updateSettings(window.LOCAL_SETTINGS))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( (new_props.logged_in_user_id && new_props.logged_in_user_id !== this.props.logged_in_user_id) ||
             new_props.are_settings_loaded !== this.props.are_settings_loaded ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, history, location, logged_in_user_id, settings,
                has_usable_password } = props
        
        if ( logged_in_user_id ) {
            dispatch(ensureUsersLoaded([logged_in_user_id]))
            if ( !has_usable_password ) {
                history.push('/password/change')
            }
        } else {
            if ( settings.configured && location && location.search ) {
                const query_params = parse(location.search)
                if ( query_params.autologin ) {
                    dispatch(auto_login(query_params.autologin))
                }
            }
        }
    }

    render() {
        const { is_logged_in, are_settings_loaded } = this.props

        const allow_non_auth = this.props.location.pathname.indexOf('password/forgot') !== -1 ||
                               this.props.location.pathname.indexOf('password/reminded') !== -1 ||
                               this.props.location.pathname.indexOf('account/create') !== -1 ||
                               this.props.location.pathname.indexOf('share/') !== -1

        
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
              { ! is_logged_in &&
                <div>
                  <Maintenance/>
                  <Error/>
                  <MainRouter />
                </div>
              }
              { is_logged_in &&
                <div className="main-layout">
                  <div className="main-layout__content">
                    <Websocket/>
                    <Header/>
                    <AutoClockPopup/>
                    <GlobalCommentAnnotation/>
                    <div className="main">
                      <MainRouter />
                    </div>
                    <ReactTooltip place="bottom" type="info" />
                  </div>
                  <Footer />
                </div>
              }  
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { configured } = isConfigured(state)
    const user = logged_in_user()
    const logged_in_user_id = user['user_id'] || null
    const has_usable_password = user['has_usable_password'] || false
    
    return {
        is_logged_in: is_authenticated(),
        are_settings_loaded: configured,
        logged_in_user_id: logged_in_user_id,
        has_usable_password: has_usable_password,
        settings: state.settings,
    }
}

export default withRouter(connect(mapStateToProps)(DragDropContext(HTML5Backend)(MainLayout)))

MainLayout.childContextTypes = {
    shortcuts: PropTypes.object.isRequired
}
