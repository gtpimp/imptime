import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import {logged_in_user} from '../actions/Auth'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
import { can_create_release_notes, logout } from '../actions/Auth'
import { showFloatingCalendar } from '../actions/CalendarEvents'
import glamorous from 'glamorous'

const NavbarDiv = glamorous.div({display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 width: "100%"},
                                ({user_initiated_network_activity=false,
                                  is_websockets_connected=false}) =>
                                      ({borderTop:(user_initiated_network_activity || !is_websockets_connected)? "1px solid #D54859" : "auto"})
)

class Navbar extends Component {

    constructor(props) {
        super(props)
        this.onSelectFloatingCalendar = this.onSelectFloatingCalendar.bind(this)
        this.onLogout = this.onLogout.bind(this)
    }

    onSelectFloatingCalendar(evt) {
        const { dispatch } = this.props
        if ( evt ) {
            evt.preventDefault()
        }
        dispatch(showFloatingCalendar())
    }

    onLogout() {
        const { dispatch, history } = this.props
        dispatch(logout())
        history.push('/')
    }

    render() {

        const {is_loading, is_saving, is_websockets_connected,
               username, has_edit_release_notes_permission} = this.props
        const user_initiated_network_activity = is_loading || is_saving

        return (
            <NavbarDiv user_initiated_network_activity={user_initiated_network_activity}
                       is_websockets_connected={is_websockets_connected}>
              <div className="navbar__left">
                <NavTab to="/projects" label="Projects" />
                <MienSelector></MienSelector>
              </div>
              <div className="navbar__right">
                <NavTab variant="dashboard-toggle" label="Calendar">
                    <div className="navbar__submenu_item" onClick={this.onSelectFloatingCalendar}>Popup</div>
                    <Link className="navbar__submenu_item" to='/calendar'>My calendar</Link>
                    <Link className="navbar__submenu_item" to='/schedule'>All calendars</Link>
                </NavTab>
                
                <NavTab variant="dashboard-toggle" label="Company" >
                  <Link className="navbar__submenu_item" to='/company/billable_hours'>Billable hours</Link>
                  <Link className="navbar__submenu_item" to='/company/problems'>Problems</Link>
                </NavTab>
                <NavTab to="/work_summary" label="Work summary" />
                <NavTab to="/dashboard" label="Dashboard" />
                <NavTab to="/usertimesheets" label="Timesheets" />
                <NavTab to="/invoices" label="Invoices"/>
                <NavTab variant="dashboard-toggle" label={username}>
                  <Link className="navbar__submenu_item" to='/password/change'>Edit profile</Link>
                  { has_edit_release_notes_permission &&
                    <Link className="navbar__submenu_item" to='/release_notes_editor'>Release notes</Link>
                  }
                    <div className="navbar__submenu_item" onClick={this.onLogout}>Logout</div>
                </NavTab>
                <NavTab>
                  <SearchBox/>
                </NavTab>
              </div>
            </NavbarDiv>
        )
    }
}

function mapStateToProps(state, props) {
    const loading = state.loading
    const websockets = state.websockets || {}
    const has_edit_release_notes_permission = can_create_release_notes(state)
    
    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected,
        username: logged_in_user(state).username,
        has_edit_release_notes_permission
    }
}

export default withRouter(connect(mapStateToProps)(Navbar))
