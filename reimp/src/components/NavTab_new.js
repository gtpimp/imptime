import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { Link } from 'react-router-dom'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'

const nav_item_css = {paddingLeft:"12px",
                      paddingRight:"12px",
                      alignItems:"center",
                      justifyContent:"center",
                      ':hover': { cursor: "pointer"}}

const NavMenuItem = styled('div')(props => (nav_item_css,
                                            {backgroundColor: psops.isActive === true ? theme.colours.panel_background : "auto",
                                             color: props.colourName === null ? "#ffffff" : theme.colours[props.colourName]}))

const NavDropdownMenuItem = styled('div')(props => (nav_item_css,
                                                    {position:"relative",
                                                     zIndex: "1",
                                                     width: "110px",
                                                     height: "36px",
                                                     backgroundColor: props.expanded === true ? theme.colours.panel_background : "auto",
                                                     color: props.colourName === null ? "#ffffff" : theme.colours[props.colourName]}))

const NavDropdownMenuContent = styled('div')(props => ({position:"relative",
                                                        width:"100px",
                                                        flexDirection: "column",
                                                        border: "1px solid red",
                                                        display: props.sub_menu_visible ? "flex" : "none"}))

const NavDropdownIcon = styled('div')(props => ({display: "inline-block",
                                                 textAlign: "center",
                                                 width: "30px"}))

class NavTab extends Component {

    constructor(props) {
        super(props)
        this.showSubMenu = this.showSubMenu.bind(this)
        this.hideSubMenu = this.hideSubMenu.bind(this)
        this.state = {sub_menu_visible: false}
    }

    showSubMenu() {
        this.setState({sub_menu_visible: true})
    }

    hideSubMenu() {
        this.setState({sub_menu_visible: false})
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
                  <NavDropdownMenuContent sub_menu_visible={sub_menu_visible}>
                    {children}
                  </NavDropdownMenuContent>
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
