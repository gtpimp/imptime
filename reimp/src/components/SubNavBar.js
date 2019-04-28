import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import NavTab from './NavTab'
import Breadcrumbs from '../components/Breadcrumbs'
import { can_create_release_notes, logout } from '../actions/Auth'
import {logged_in_user} from '../actions/Auth'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'
import { cx, css } from 'emotion'
import AutoClockPopup from './auto_clock/AutoClockPopup'
import DueIssueListIndicator from './DueIssueListIndicator'

const navbar_submenu_item = css`color: theme.colours.link;
                                font: theme.fonts.link;
                                margin-top: 12px;
                                text-transform: none;
                                padding-left: 12px;
                                border-bottom: 1px solid #eee;
                                cursor: pointer;
                                &:hover {
                                    color: #333;
                                    background-color: #eee;
                                }`

const SubNavBarDiv = styled('div')(props => ({display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                              height: "36px",
                                              color: theme.colours.strong_text,
                                              backgroundColor: theme.colours.sub_nav_bar,
                                              fontSize: "15px",
                                              marginRight: "3px",
                                              width: "100%"}))

const ToolbarDiv = styled('div')(props => ({alignItems: "center",
                                            display: "flex",
                                            flexGrow: "1",
                                            paddingLeft: "24px",
                                            justifyContent: props.side === 'left' ?  'flex-start' : 'flex-end'}))


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

                <AutoClockPopup />
                <DueIssueListIndicator />
                <NavTab variant="dashboard-toggle" label={username} colourName="normal_text">

                  { false && 
                    <div className={`${navbar_submenu_item}`}>
                      <Link to='/password/change'>Edit profile</Link>
                    </div>
                  }

                  <div className={`${navbar_submenu_item}`}>
                    <Link to='/onboarding'>Onboarding</Link>
                  </div>
                  
                  { has_edit_release_notes_permission &&
                    <div className={`${navbar_submenu_item}`}>
                      <Link to='/release_notes_editor'>Release notes</Link>
                    </div>
                  }
                  <div onClick={this.onLogout} className={`${navbar_submenu_item}`}>
                    Logout
                  </div>
                </NavTab>
                { false && 
                <NavTab>
                  <div className={css`height: 36px;
                                      paddding: 3px;`}>
                    <i className={cx("material-icons", css`width:30px; height:30px`)}>
                      account_circle
                    </i>
                  </div>
                </NavTab>
                }
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


export default withRouter(connect(mapStateToProps)(SubNavBar))
