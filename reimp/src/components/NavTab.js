import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { Link } from 'react-router-dom' 
import classNames from 'classnames'
import '../sass/navtab.css'
import glamorous from 'glamorous'
import { default_theme as theme } from '../glamorous/theme'

const NavMenuItem = glamorous.div({"color":"#ffffff",
                                   "paddingLeft":"12px",
                                   "paddingRight":"12px"},
                                  ({isActive=false}) => ( {'backgroundColor': isActive === true ? theme.colours.panel_background : "auto"})
)

const NavDropdownMenuItem = glamorous.div({"color":"#ffffff",
                                           "paddingLeft": "24px",
                                           "paddingRight": "24px"},
                                          ({expanded=false}) => ({'backgroundColor': expanded === true ? theme.colours.panel_background : "auto"})
)
                                                                  


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
        const {match, to, children, variant, expanded} = this.props
        const {show_children} = this.state

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
                <NavDropdownMenuItem expanded={expanded} onMouseOver={this.showSubMenu} onMouseOut={this.hideSubMenu}>
                    <div className="navtab__label-wrapper">
                      <div className={classNames('navtab__label', 'navtab__label--inactive')}>
                        {this.props.label}&nbsp;
                      </div>
                        <div className="navtab__icon">
                          <i className="material-icons">
                            {this.props.expanded ? 'arrow_drop_up' : 'arrow_drop_down'}
                          </i>
                        </div>
                    </div>
                    { show_children && children }
                </NavDropdownMenuItem>
            )
        }
    }
}

function mapStateToProps(state, props) {

    return {
        variant: props.variant || 'link',
    }
}

export default withRouter(connect(mapStateToProps)(NavTab))
