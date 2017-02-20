import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import Navbar from '../components/Navbar'
import Toolbar from './toolbar/Toolbar'
import UserDashboard from '../components/UserDashboard'

class Header extends Component {

    render() {
        const { user_dashboard_expanded } = this.props
        return (
            <div className="header">
                <Navbar/>
                { user_dashboard_expanded &&
                    <UserDashboard/>
                }
                <Toolbar />
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { header } = state;

    return {
        user_dashboard_expanded: header.user_dashboard_expanded
    }
}

export default connect(mapStateToProps)(Header)
