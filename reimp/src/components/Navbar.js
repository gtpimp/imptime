import React, {Component} from 'react'
import {connect} from 'react-redux'
import SearchBox from '../components/SearchBox'
import {logged_in_user} from '../actions/Auth'
import UserDashboard from '../components/UserDashboard'
import classNames from 'classnames'
import '../sass/navbar.css'
import NavTab from './NavTab'
import MienSelector from './MienSelector'
import { updateNavbarHeight } from '../actions/Header'

class Navbar extends Component {

    constructor(props) {
        super(props)
        this.showUserMenu = this.showUserMenu.bind(this)
        this.hideUserMenu = this.hideUserMenu.bind(this)
        this.state = {user_menu_visible: false}
    }

    componentDidMount() {
        const { dispatch } = this.props
        const navbarHeight = this.navbarElem.clientHeight
        dispatch(updateNavbarHeight(navbarHeight))
    }

    showUserMenu() {
        this.setState({user_menu_visible: true})
    }

    hideUserMenu() {
        this.setState({user_menu_visible: false})
    }

    render() {

        const {  is_loading, is_saving, is_websockets_connected, username } = this.props
        const user_initiated_network_activity = is_loading || is_saving
        const user_menu_visible = this.state.user_menu_visible

        return (
            <div className={classNames('navbar', 'navbar--network-' + ( user_initiated_network_activity ? 'active' : 'inactive' ))} ref={(navbar) => { this.navbarElem = navbar }}>
              <div className="navbar__left">
                <NavTab to="/" index={true}>
                  <div className={classNames('navbar__component', 'navbar__branding', 'navbar__branding--' +(is_websockets_connected ? 'connected' : 'disconnected'))}>
            &nbsp;
                        </div>
                    </NavTab>
                    <div className="navbar__component navbar__search"><SearchBox/></div>
                    <MienSelector></MienSelector>
                </div>
                <div className="navbar__right">
                  <div className="navbar__tab"><NavTab to="/nudge" label="Nudge" /></div>
                  <div className="navbar__tab"><NavTab to="/schedule" label="Schedule" /></div>
                  <div className="navbar__tab"><NavTab to="/work_summary" label="Work summary" /></div>
                  <div className="navbar__tab"><NavTab to="/dashboard" label="Dashboard" /></div>
                  <div className="navbar__tab"><NavTab to="/usertimesheets" label="Timesheets" /></div>
                  <div className="navbar__tab"><NavTab to="/projects" label="Projects" /></div>
                  <div className="navbar__tab"><NavTab to="/invoices" label="Invoices"/></div>
                  <div className="navbar__tab" onMouseOver={this.showUserMenu} onMouseLeave={this.hideUserMenu} >
                    <NavTab variant="dashboard-toggle" label={username} />
                    { user_menu_visible &&
                      <UserDashboard/>
                    }

                  </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const loading = state.loading
    const websockets = state.websockets || {}

    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected,
        username: logged_in_user(state).username
    }
}

export default connect(mapStateToProps)(Navbar)
