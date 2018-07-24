import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import {logged_in_user} from '../actions/Auth'
import { getLoggedInUser } from '../actions/Users'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
import { can_create_release_notes, logout } from '../actions/Auth'
import { showFloatingCalendar } from '../actions/CalendarEvents'
import glamorous from 'glamorous'

const NavbarDiv = glamorous.div({display: "flex",
                                 background: "linear-gradient(#0b8bb2, #056a86)",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 height: "36px",
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

        const {  is_loading, is_saving, is_websockets_connected,
                 username, has_edit_release_notes_permission, default_schedule_id  } = this.props
        const user_initiated_network_activity = is_loading || is_saving

        return (
            <NavbarDiv user_initiated_network_activity={user_initiated_network_activity}
                       is_websockets_connected={is_websockets_connected}>
              <div className="navbar__left">
                <NavTab to="/projects" label="Projects" />
                <MienSelector></MienSelector>
              </div>
              <div className="navbar__right">
                <div className="navbar__tab" onMouseOver={this.showCalendarMenu} onMouseLeave={this.hideCalendarMenu}>
                  <NavTab variant="dashboard-toggle" label="Calendar" />
                  { calendar_menu_visible &&
                    <div className="navbar__submenu">
                      <div className="navbar__submenu_item" onClick={this.onSelectFloatingCalendar}>Popup</div>
                      <Link className="navbar__submenu_item" to={'/schedule/'+default_schedule_id}>Nudge</Link>
                      <Link className="navbar__submenu_item" to='/calendar'>My calendar</Link>
                      <Link className="navbar__submenu_item" to='/schedule'>All calendars</Link>
                    </div>
                  }
                </div>
                <div className="navbar__tab" onMouseOver={this.showCompanyMenu} onMouseLeave={this.hideCompanyMenu}>
                  <NavTab variant="dashboard-toggle" label="Company" />
                  { company_menu_visible &&
                    <div className="navbar__submenu">
                      <Link className="navbar__submenu_item" to='/company/billable_hours'>Billable hours</Link>
                      <Link className="navbar__submenu_item" to='/company/problems'>Problems</Link>
                    </div>
                  }
                </div>
                <div className="navbar__tab"><NavTab to="/work_summary" label="Work summary" /></div>
                <div className="navbar__tab"><NavTab to="/dashboard" label="Dashboard" /></div>
                <div className="navbar__tab"><NavTab to="/usertimesheets" label="Timesheets" /></div>
                <div className="navbar__tab"><NavTab to="/projects" label="Projects" /></div>
                <div className="navbar__tab"><NavTab to="/invoices" label="Invoices"/></div>
                <div className="navbar__tab" onMouseOver={this.showUserMenu} onMouseLeave={this.hideUserMenu} >
                  <NavTab variant="dashboard-toggle" label={username} />
                  { user_menu_visible &&
                    <div className="navbar__submenu">
                      <Link className="navbar__submenu_item" to='/password/change'>Edit profile</Link>
                      { has_edit_release_notes_permission &&
                        <Link className="navbar__submenu_item" to='/release_notes_editor'>Release notes</Link>
                      }
                      <div className="navbar__submenu_item" onClick={this.onLogout}>Logout</div>
                    </div>                    
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
    const default_schedule_id = (getLoggedInUser(state) || {}).default_schedule_id
    
    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected,
        username: logged_in_user(state).username,
        has_edit_release_notes_permission,
        default_schedule_id
    }
}

export default withRouter(connect(mapStateToProps)(Navbar))
