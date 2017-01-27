import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import Navbar from '../components/Navbar'
import UserDashboard from '../components/UserDashboard'

class Header extends Component {

    render() {
        const is_dashboard_expanded = true
        return (
            <div className="header">
                <Navbar/>
                { is_dashboard_expanded &&
                    <UserDashboard/>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(Header)
