import React, {Component} from 'react'
import {connect} from 'react-redux'
import SearchBox from '../components/SearchBox'
import {logged_in_user} from '../actions/Auth'
import { collapseUserDashboard, expandUserDashboard } from '../actions/Header'
import classNames from 'classnames'
import '../sass/navbar.css'
import NavTab from './NavTab'

class Navbar extends Component {

    constructor(props) {
        super(props)
        this.toggleUserDashboard = this.toggleUserDashboard.bind(this)
    }

    toggleUserDashboard() {
        const { dispatch, user_dashboard_expanded } = this.props
        if (user_dashboard_expanded) {
            dispatch(collapseUserDashboard())
        } else {
            dispatch(expandUserDashboard())
        }
    }

    render() {

        const { is_websockets_connected, user_dashboard_expanded, username} = this.props

        return (
            <div className="navbar">
                <div className="navbar__left">
                    <NavTab to="/" index={true}>
                        <div className={classNames('navbar__component', 'navbar__branding', 'navbar__branding--' +(is_websockets_connected ? 'connected' : 'disconnected'))}>
                            &nbsp;
                        </div>
                    </NavTab>
                    <div className="navbar__component navbar__search"><SearchBox/></div>
                </div>
                <div className="navbar__right">
                    <div className="navbar__tab"><NavTab to="/projects" label="Projects" /></div>
                    <div className="navbar__tab"><NavTab to="/clients" label="Clients"/></div>
                    <div className="navbar__tab"><NavTab to="/team" label="Team" /></div>
                    <div className="navbar__tab" onClick={this.toggleUserDashboard}><NavTab variant="dashboard-toggle" expanded={user_dashboard_expanded} label={username} /></div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { header } = state
    const websockets = state.websockets || {}

    return {
        is_websockets_connected: websockets.isConnected,
        user_dashboard_expanded: header.user_dashboard_expanded,
        username: logged_in_user(state).username
    }
}

export default connect(mapStateToProps)(Navbar)
