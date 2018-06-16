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


class Navbar extends Component {

    constructor(props) {
        super(props)
        this.showUserMenu = this.showUserMenu.bind(this)
        this.hideUserMenu = this.hideUserMenu.bind(this)
        this.showCompanyMenu = this.showCompanyMenu.bind(this)
        this.hideCompanyMenu = this.hideCompanyMenu.bind(this)
        this.showCalendarMenu = this.showCalendarMenu.bind(this)
        this.hideCalendarMenu = this.hideCalendarMenu.bind(this)
        this.onSelectFloatingCalendar = this.onSelectFloatingCalendar.bind(this)
        this.onLogout = this.onLogout.bind(this)
        this.state = {user_menu_visible: false,
                      company_menu_visible: false,
                      calendar_menu_visible: false}
    }

    showUserMenu() {
        this.setState({user_menu_visible: true})
    }

    hideUserMenu() {
        this.setState({user_menu_visible: false})
    }

    showCompanyMenu() {
        this.setState({company_menu_visible: true})
    }

    hideCompanyMenu() {
        this.setState({company_menu_visible: false})
    }

    showCalendarMenu() {
        this.setState({calendar_menu_visible: true})
    }

    hideCalendarMenu() {
        this.setState({calendar_menu_visible: false})
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
                 username, has_edit_release_notes_permission  } = this.props
        const user_initiated_network_activity = is_loading || is_saving
        const user_menu_visible = this.state.user_menu_visible
        const company_menu_visible = this.state.company_menu_visible
        const calendar_menu_visible = this.state.calendar_menu_visible

        return (
            <glamorous.Div borderTop={(user_initiated_network_activity || !is_websockets_connected) ? "1px solid #D54859" : "1px solid #FFFFFF"}
                           display="flex"
                           justifyContent="space-between"
                           alignItems="center"
                           width="100%">
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
                </div>
                <SearchBox/>
              </div>
            </glamorous.Div>
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
