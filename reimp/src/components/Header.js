import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import Navbar from '../components/Navbar'
import Toolbar from './toolbar/Toolbar'
import UserDashboard from '../components/UserDashboard'
import ReleaseNotesPopup from '../components/ReleaseNotesPopup'
import Maintenance from './Maintenance'

class Header extends Component {

    render() {
        const { user_dashboard_expanded } = this.props
        return (
            <div className="header">
              <Maintenance/>
              <Navbar/>
              { user_dashboard_expanded &&
                <UserDashboard/>
              }
              <Toolbar />
              <ReleaseNotesPopup />
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
