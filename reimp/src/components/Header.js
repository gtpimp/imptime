import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/header.css'
import { logged_in_user } from '../actions/Auth'
import Navbar from '../components/Navbar'
import SubNavBar from './SubNavBar'
import ReleaseNotesPopup from '../components/ReleaseNotesPopup'
import Maintenance from './Maintenance'
import Error from './Error'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'


const HeaderDiv = glamorous.div({font: theme.fonts.header})

class Header extends Component {
    
    render() {
        const { has_usable_password } = this.props

        return (
            <HeaderDiv className="header">
              <Maintenance/>
              <Error/>
              <Navbar/>
              <SubNavBar />
              { has_usable_password &&
                <ReleaseNotesPopup />
              }
            </HeaderDiv>
        )
    }
}

function mapStateToProps(state) {

    const user = logged_in_user()
    const has_usable_password = user['has_usable_password'] || false
    return {
        has_usable_password
    }
}

export default connect(mapStateToProps)(Header)
