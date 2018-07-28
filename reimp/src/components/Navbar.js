import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {Link} from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import AutoClockPopup from '../components/auto_clock/AutoClockPopup'
import {logged_in_user} from '../actions/Auth'
import { getLoggedInUser } from '../actions/Users'
import classNames from 'classnames'
import '../sass/navbar.css'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
import { showFloatingCalendar } from '../actions/CalendarEvents'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'

const navbar_submenu_item = {color: "#ffffff",
                             font: theme.fonts.regular_large,
                             paddingTop: '12px',
                             textTransform: 'none',
                             paddingLeft: '12px',
                             borderBottom: '1px solid #eee',

                             '&:hover': {
                                 color: '#333',
                                 backgroundColor: '#eee',
                                 cursor: 'pointer',
                             }}

const NavbarDiv = styled('div')(props => ({display: "flex",
                                           color: "#ffffff",
                                           background: "linear-gradient(#0b8bb2, #056a86)",
                                           justifyContent: "space-between",
                                           alignItems: "center",
                                           height: "36px",
                                           width: "100%",
                                           borderTop:(props.user_initiated_network_activity || !props.is_websockets_connected)? "1px solid #D54859" : "auto"}
))

const NavbarLeftDiv = styled('div')(props => ({display: 'flex',
                                               width: '41.3%',
                                               paddingLeft: '12px'}))

const NavbarRightDiv = styled('div')(props => ({display: 'flex',
                                                width: "58.7%"}))

const GlamLink = styled(Link)(props => (navbar_submenu_item))

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

        const {  is_loading, is_saving, is_websockets_connected,
                 username, has_edit_release_notes_permission, default_schedule_id  } = this.props
        const user_initiated_network_activity = is_loading || is_saving
        
        return (
            <NavbarDiv user_initiated_network_activity={user_initiated_network_activity}
                       is_websockets_connected={is_websockets_connected}>
              <NavbarLeftDiv>
                <NavTab to="/projects" label="Projects" />
              </NavbarLeftDiv>
              <NavbarRightDiv>
                <NavTab variant="dashboard-toggle" label="Mien">
                  <MienSelector></MienSelector>
                </NavTab>
                <NavTab variant="dashboard-toggle" label="Calendar" >
                  <GlamLink to='/calendar'>My calendar</GlamLink>
                  <GlamLink to={'/schedule/'+default_schedule_id}>Nudge</Link>
                  <GlamLink to='/calendar'>My calendar</Link>
                  <GlamLink to='/schedule'>All calendars</GlamLink>
                </NavTab>               
                <NavTab variant="dashboard-toggle" label="Company" >
                  <GlamLink to='/company/billable_hours'>Billable hours</GlamLink>
                  <GlamLink to='/company/problems'>Problems</GlamLink>
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
              </NavbarRightDiv>
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
