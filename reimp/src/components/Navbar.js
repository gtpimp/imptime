import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {Link} from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import AutoClockPopup from '../components/auto_clock/AutoClockPopup'
import { getLoggedInUser } from '../actions/Users'
import '../sass/navbar.css'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
import { showFloatingCalendar } from '../actions/CalendarEvents'
import { css } from 'emotion'
import styled from 'react-emotion'
import PopupPanelButton from './PopupPanelButton'

const NavbarDiv = styled('div')(props => ({display: "flex",
                                           color: "#ffffff",
                                           background: "linear-gradient(#0b8bb2, #056a86)",
                                           justifyContent: "space-between",
                                           alignItems: "center",
                                           height: "36px",
                                           width: "100%",
                                           paddingRight: "3px",
                                           borderTop:(props.user_initiated_network_activity || !props.is_websockets_connected)? "1px solid #D54859" : "auto"}
))

const NavbarRightDiv = styled('div')(props => ({display: 'flex'}))

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
                 default_schedule_id  } = this.props
        const user_initiated_network_activity = is_loading || is_saving
        
        return (
            <NavbarDiv user_initiated_network_activity={user_initiated_network_activity}
                       is_websockets_connected={is_websockets_connected}>
              <div className={css`display: flex;
                                  margin-left: 12px;
                                  margin-right: 3px;
                                 `}>

                <NavTab to="/projects" label="Projects" />
              </div>
              <NavbarRightDiv>
                <NavTab variant="dashboard-toggle" label="Mien">
                  <MienSelector></MienSelector>
                </NavTab>
                <NavTab variant="dashboard-toggle" label="Calendar" >
                  <PopupPanelButton>
                    <Link to='/calendar'>My calendar</Link>
                  </PopupPanelButton>
                  <PopupPanelButton>
                    <Link to={'/schedule/'+default_schedule_id}>Nudge</Link>
                  </PopupPanelButton>
                  <PopupPanelButton>
                    <Link to='/calendar'>My calendar</Link>
                  </PopupPanelButton>
                  <PopupPanelButton>
                    <Link to='/schedule'>All calendars</Link>
                  </PopupPanelButton>
                </NavTab>               
                <NavTab variant="dashboard-toggle" label="Company" >
                  <PopupPanelButton>
                    <Link to='/company/billable_hours'>Billable hours</Link>
                  </PopupPanelButton>
                  <PopupPanelButton>
                    <Link to='/company/problems'>Problems</Link>
                  </PopupPanelButton>
                  <PopupPanelButton>
                    <Link to='/invoices'>Invoices</Link>
                  </PopupPanelButton>
                  <PopupPanelButton>
                    <Link to="/usertimesheets">Timesheets</Link>
                  </PopupPanelButton>
                </NavTab>
                <NavTab to="/work_summary" label="Work summary" />
                <NavTab to="/dashboard" label="Dashboard" />
                <NavTab>
                  <AutoClockPopup/>
                </NavTab>
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
    const default_schedule_id = (getLoggedInUser(state) || {}).default_schedule_id
    
    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected,
        default_schedule_id
    }
}

export default withRouter(connect(mapStateToProps)(Navbar))
