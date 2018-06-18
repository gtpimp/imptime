import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import AutoClockPopup from '../components/auto_clock/AutoClockPopup'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
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
    }

    onSelectFloatingCalendar(evt) {
        const { dispatch } = this.props
        if ( evt ) {
            evt.preventDefault()
        }
        dispatch(showFloatingCalendar())
    }

    render() {

        const {is_loading, is_saving, is_websockets_connected} = this.props
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
                <NavTab>
                  <AutoClockPopup/>
                </NavTab>
                <NavTab to="/usertimesheets" label="Timesheets" />
                <NavTab to="/invoices" label="Invoices"/>
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
    
    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected
    }
}

export default withRouter(connect(mapStateToProps)(Navbar))
