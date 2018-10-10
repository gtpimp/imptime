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
import FloatingPlanningCalendar from '../components/FloatingPlanningCalendar'
import Error from '../components/Error'
import Maintenance from '../components/Maintenance'
import GlobalCommentAnnotation from '../components/GlobalCommentAnnotation'
import MainRouter from './MainRouter'
import { ShortcutManager } from 'react-shortcuts'
import keymap from '../actions/Keymap'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'
import { ensureMiensLoaded, getCurrentMienId, getCurrentMien } from '../actions/Mien'

var HTML5Backend = require('react-dnd-html5-backend');
const shortcut_manager = new ShortcutManager(keymap)

const AppDiv = styled('div')(props => ({
    'backgroundColor': theme.colours.page_background,
    'height': '100%',
    'minHeight': '100vh',
    'font': theme.fonts.body,
    'display':'flex',
    'flexDirection': 'column',
    'justifyContent': 'center',
    'margin': '0 auto'}))


class MainLayout extends Component {
    
    getChildContext() {
        return { shortcuts: shortcut_manager }
    }
    
    componentDidMount() {
        const { dispatch, current_mien, current_mien_id } = this.props
        dispatch(updateSettings(window.LOCAL_SETTINGS))
        if ( current_mien_id && !current_mien ) {
            dispatch(ensureMiensLoaded([current_mien_id]))
        }
        
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, current_mien_id, current_mien } = new_props
        if ( (new_props.logged_in_user_id && new_props.logged_in_user_id !== this.props.logged_in_user_id) ||
             new_props.are_settings_loaded !== this.props.are_settings_loaded ) {
            this.refresh(new_props)
        }
        if ( current_mien_id && !current_mien ) {
            dispatch(ensureMiensLoaded([current_mien_id]))
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

        // hack, better to abstract the router up one level
        const self_contained_page = this.props.location.pathname.indexOf("fullscreen/") !== -1

        if ( ! are_settings_loaded ) {
            return (
                <AppDiv id="app">Loading settings...</AppDiv>
            )
        }

        if ( ! is_logged_in && ! allow_non_auth  ) {
            return (
                <AppDiv id="app">
                  <LoginPage />
                </AppDiv>
            )
        }

        if ( ! is_logged_in ) {
            return (
                <AppDiv id="app">
                  <Maintenance/>
                  <Error/>
                  <MainRouter />
                </AppDiv>
            )
        }

        if ( self_contained_page ) {
            return (
                <AppDiv id="app">
                  <Websocket/>
                  <MainRouter />
                </AppDiv>
            )
        }

        return (
            <AppDiv id="app">
              <div className="main-layout__panel main-layout__header">
                <div>
                  <Websocket/>
                  <Header/>
                  <FloatingPlanningCalendar/>
                  <GlobalCommentAnnotation/>
                </div>
              </div>
              <div className="main-layout__panel  main-layout__middle">
                <div className="main-layout__scroll-container">
                  <MainRouter />
                </div>
              </div>
              <div className="main-layout__panel main-layout__footer">
                <Footer />
              </div>
            </AppDiv>
        )
    }
}

function mapStateToProps(state) {
    const { configured } = isConfigured(state)
    const user = logged_in_user()
    const logged_in_user_id = user['user_id'] || null
    const has_usable_password = user['has_usable_password'] || false
    const current_mien_id =  getCurrentMienId(state)
    const current_mien = getCurrentMien(state)
    
    return {
        is_logged_in: is_authenticated(),
        are_settings_loaded: configured,
        logged_in_user_id: logged_in_user_id,
        has_usable_password: has_usable_password,
        settings: state.settings,
        current_mien_id,
        current_mien
    }
}

export default withRouter(connect(mapStateToProps)(DragDropContext(HTML5Backend)(MainLayout)))

MainLayout.childContextTypes = {
    shortcuts: PropTypes.object.isRequired
}
