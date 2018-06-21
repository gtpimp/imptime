import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
// import '../sass/toolbar.css'
import NavTab from './NavTab'
import Breadcrumbs from '../components/Breadcrumbs'
import { can_create_release_notes, logout } from '../actions/Auth'
import {logged_in_user} from '../actions/Auth'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const SubNavBarDiv = glamorous.div({display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: "36px",
                                    color: theme.colours.strong_text,
                                    fontSize: "15px",
                                    width: "100%"})

const ToolbarDiv = glamorous.div({alignItems: "center",
                                  display: "flex",
                                  flexGrow: "1"},
                                 ({side}) => ({justifyContent: side === 'left' ?  'flex-start' : 'flex-end'})
)

class SubNavBar extends Component {

    constructor(props) {
        super(props)
        this.onLogout = this.onLogout.bind(this)
    }

    onLogout() {
        const { dispatch, history } = this.props
        dispatch(logout())
        history.push('/')
    }
    
    render() {
        const {username, has_edit_release_notes_permission} = this.props
        return (
            <SubNavBarDiv>
              <ToolbarDiv side="left">
                <Breadcrumbs />
              </ToolbarDiv>
              <div className="toolbar__container toolbar__container--right">
                <NavTab variant="dashboard-toggle" label={username} colourName="normal_text">
                  <Link className="navbar__submenu_item" to='/password/change'>Edit profile</Link>
                  { has_edit_release_notes_permission &&
                    <Link className="navbar__submenu_item" to='/release_notes_editor'>Release notes</Link>
                  }
                  <div className="navbar__submenu_item" onClick={this.onLogout}>Logout</div>
                </NavTab>
              </div>
              
            </SubNavBarDiv>
        )
    }
}

function mapStateToProps(state, props) {
    const has_edit_release_notes_permission = can_create_release_notes(state)

    return {
        username: logged_in_user(state).username,
        has_edit_release_notes_permission
    }
}


export default connect(mapStateToProps)(SubNavBar)
