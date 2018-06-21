import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import AutoClockPopup from '../components/auto_clock/AutoClockPopup'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
import { showFloatingCalendar } from '../actions/CalendarEvents'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const navbar_submenu_item = {color: theme.colours.link,
                                 font: theme.fonts.links,
                                 marginTop: '12px',
                                 textTransform: 'none',
                                 paddingLeft: '12px',
                                 borderBottom: '1px solid #eee',

                                 ':hover': {
                                     color: '#333',
                                     backgroundColor: '#eee',
                                     cursor: 'pointer',
                                 }}

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

const NavbarLeftDiv = glamorous.div({display: "flex"})

const NavbarRightDiv = glamorous.div({display: "flex",
                                      width: "1010px"})

const PopUpLink = glamorous.div(navbar_submenu_item)

const GlamLink = glamorous(Link)(navbar_submenu_item)

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
              <NavbarLeftDiv>
                <NavTab to="/projects" label="Projects" />
              </NavbarLeftDiv>
              <NavbarRightDiv>
                <NavTab variant="dashboard-toggle" label="Mien">
                  <MienSelector></MienSelector>
                </NavTab>
                <NavTab variant="dashboard-toggle" label="Calendar">
                  <PopUpLink onClick={this.onSelectFloatingCalendar}>Popup</PopUpLink>
                  <GlamLink to='/calendar'>My calendar</GlamLink>
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
    
    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected
    }
}

export default withRouter(connect(mapStateToProps)(Navbar))
