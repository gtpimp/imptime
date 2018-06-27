import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import NavTab from './NavTab'
import Breadcrumbs from '../components/Breadcrumbs'
import { can_create_release_notes, logout } from '../actions/Auth'
import {logged_in_user} from '../actions/Auth'
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

const SubNavBarDiv = glamorous.div({display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: "36px",
                                    color: theme.colours.strong_text,
                                    backgroundColor: theme.colours.sub_nav_bar,
                                    fontSize: "15px",
                                    width: "100%"})

const ToolbarDiv = glamorous.div({alignItems: "center",
                                  display: "flex",
                                  flexGrow: "1",
                                  paddingLeft: "24px"},
                                 ({side}) => ({justifyContent: side === 'left' ?  'flex-start' : 'flex-end'})
)

const ProfilePictureDiv = glamorous.div({height: "36px",
    padding: "3px"})

const ProfilePictureIcon = glamorous.i({width: "30px",
                                        height: "30px"})

const GlamLink = glamorous(Link)(navbar_submenu_item)

const DivLink = glamorous.div(navbar_submenu_item)

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
              <ToolbarDiv side="right">
                <NavTab variant="dashboard-toggle" label={username} colourName="normal_text">
                  <GlamLink to='/password/change'>Edit profile</GlamLink>
                  { has_edit_release_notes_permission &&
                    <GlamLink to='/release_notes_editor'>Release notes</GlamLink>
                  }
                  <DivLink onClick={this.onLogout}>Logout</DivLink>
                </NavTab>
                <NavTab>
                  <ProfilePictureDiv>
                    <ProfilePictureIcon className="material-icons">account_circle</ProfilePictureIcon>
                  </ProfilePictureDiv>
                </NavTab>
              </ToolbarDiv>
              
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
