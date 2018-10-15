import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { Link } from 'react-router-dom' 
import styled from 'react-emotion'
import { cx, css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import PopupPanel from './PopupPanel'
import NavTabPopup from './NavTabPopup'
import NavMenuItem from './NavMenuItem'

const nav_item_css = {paddingLeft:"12px",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      '&:hover': { cursor: "pointer"}}



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
        this.toggleSubMenu = this.toggleSubMenu.bind(this)
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

    toggleSubMenu() {
        const { sub_menu_visible, expanded } = this.state
        this.setState({sub_menu_visible: !sub_menu_visible,
                       expanded: !expanded})
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
                                     onMouseLeave={this.hideSubMenu}
                                     colourName={colourName || null}>
                  <div onClick={this.toggleSubMenu}>
                    {this.props.label}
                  </div>
                  <NavDropdownIcon>
                    <i className={cx("material-icons", css`font-size:${theme.font_sizes.dropdown_arrow}`)} >
                      {this.props.expanded ? 'arrow_drop_up' : 'arrow_drop_down'}
                    </i>
                  </NavDropdownIcon>

                  { sub_menu_visible && 
                    <NavTabPopup>
                      <PopupPanel>
                        {children}
                      </PopupPanel>
                    </NavTabPopup>
                  }
                </NavDropdownMenuItem>
            )
        } else if ( variant === "component_handled" ) {
            return children
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
