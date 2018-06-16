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
                                  ({isActive=false}) => ( {'backgroundColor': isActive === true ? theme.colours.panel_background : "inherit"}))

const NavDropdownMenuItem = glamorous.div({"color":"#ffffff",
                                           "paddingLeft": "24px",
                                           "paddingRight": "24px"})


class NavTab extends Component {

    render() {
        const {match, to, children, variant} = this.props

        if (variant === 'link') {
            let isActive
            isActive = match.path === to

            return (
                <NavMenuItem isActive={isActive}>
                  { this.props.label &&
                    <Link to={to}>
                      {this.props.label}
                    </Link>
                  }
                  { !this.props.label &&
                    <Link to={to}>{children}</Link>
                  }
                </NavMenuItem>
            )
        } else if (variant === 'dashboard-toggle') {
            return (
                <NavDropdownMenuItem className={classNames('navtab', 'navtab--' + (this.props.expanded ? 'expanded' : 'collapsed'))}>
                    <div className="navtab__label-wrapper">
                        <div className={classNames('navtab__label', 'navtab__label--inactive')}>{this.props.label}&nbsp;</div>
                        <div className="navtab__icon"><i className="material-icons">{this.props.expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</i></div>
                    </div>
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
