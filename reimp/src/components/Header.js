import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import Navbar from '../components/Navbar'
import Toolbar from './toolbar/Toolbar'
import ReleaseNotesPopup from '../components/ReleaseNotesPopup'
import Maintenance from './Maintenance'
import Error from './Error'

class Header extends Component {

    render() {
        return (
            <div className="header">
              <Maintenance/>
              <Error/>
              <Navbar/>
              <Toolbar />
              <ReleaseNotesPopup />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
    }
}

export default connect(mapStateToProps)(Header)
