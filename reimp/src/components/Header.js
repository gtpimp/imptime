import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import Navbar from '../components/Navbar'
import NotificationBar from '../components/NotificationBar'
import UserDashboard from '../components/UserDashboard'

class Header extends Component {

    render() {
        const { user_dashboard_expanded } = this.props
        return (
            <div className="header">
                <Navbar/>
                <NotificationBar/>
                { user_dashboard_expanded &&
                    <UserDashboard/>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { header } = state;

    return {
        user_dashboard_expanded: header.user_dashboard_expanded
    }
}

export default connect(mapStateToProps)(Header)
