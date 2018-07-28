import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { Link } from 'react-router-dom' 
import styled from 'react-emotion'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'

const nav_item_css = {paddingLeft:"12px",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      '&:hover': { cursor: "pointer"}}

const NavMenuItem = styled('div')(props => Object.assign(nav_item_css,
                                                         {cursor: "pointer",
                                                          backgroundColor: props.isActive === true ? theme.colours.panel_background : "auto",
                                                          color: props.colourName === null ? "#ffffff" : theme.colours[props.colourName]}))

const NavDropdownMenuItem = styled('div')(props => Object.assign(nav_item_css,
                                          {position:"relative",
                                           zIndex: "1",
                                           minWidth: "110px",
                                           height: "36px",
                                           backgroundColor: props.expanded === true ? theme.colours.panel_background : "auto",
                                           color: props.colourName === null ? "#ffffff" : theme.colours[props.colourName]}))

const NavDropdownIcon = styled('div')(props => ({display: "inline-block",
                                                 textAlign: "center",
                                                 width: "30px"}))

class NavTab extends Component {

    constructor(props) {
        super(props)
        this.showSubMenu = this.showSubMenu.bind(this)
        this.hideSubMenu = this.hideSubMenu.bind(this)
        this.state = {sub_menu_visible: false,
                      expanded: false}
    }

    showSubMenu() {
        this.setState({sub_menu_visible: true,
                       expanded: true})
    }

    hideSubMenu() {
        this.setState({sub_menu_visible: false,
                       expanded: false})
    }
    
    render() {
        const {match, to, children, variant, expanded, colourName} = this.props
        const {sub_menu_visible} = this.state
        
        if (variant === 'link') {
            let isActive
            isActive = match.path === to

            return (
                <NavMenuItem isActive={isActive}>
                  { this.props.label && to &&
                    <Link to={to}>
                      {this.props.label}
                    </Link>
                  }
                  { !this.props.label && to &&
                    <Link to={to}>{children}</Link>
                  }
                  { !to &&
                    <div>{children}</div>
                  }
                </NavMenuItem>
            )
        } else if (variant === 'dashboard-toggle') {
            return ( 
                <NavDropdownMenuItem expanded={expanded}
                                     onMouseOver={this.showSubMenu}
                                     onMouseOut={this.hideSubMenu}
                                     colourName={colourName || null}>
                  {this.props.label}
                  <NavDropdownIcon>
                    <i className={cx("material-icons", css`font-size:${theme.font_sizes.dropdown_arrow}`)} >
                      {this.props.expanded ? 'arrow_drop_up' : 'arrow_drop_down'}
                    </i>
                  </NavDropdownIcon>
                  <div className={css`position:absolute;
                                      top: 36px;
                                      z-index:9;
                                      -webkit-box-shadow: 13px 14px 14px -10px rgba(0,0,0,0.39);
                                      -moz-box-shadow: 13px 14px 14px -10px rgba(0,0,0,0.39);
                                      box-shadow: 13px 14px 14px -10px rgba(0,0,0,0.39);
                                      color: ${theme.colours.strong_text};
                                      padding: 24px;
                                      min-width: 290px;
                                      flex-direction: column;
                                      background-color: ${theme.colours.panel_background};
                                      display: ${sub_menu_visible ? "flex" : "none"}`}
                  >
                    {children}
                  </div>
                </NavDropdownMenuItem>
            )
        }
    }
}

function mapStateToProps(state, props) {

    const { colourName } = props
    
    return {
        variant: props.variant || 'link',
        colourName
    }
}

export default withRouter(connect(mapStateToProps)(NavTab))
