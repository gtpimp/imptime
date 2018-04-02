import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import { Link } from 'react-router-dom' 
import classNames from 'classnames'
import '../sass/navtab.css'
import without from 'lodash/without'

class NavTab extends Component {

    render() {
        const {match, index, to, children, variant} = this.props

        if (variant === 'link') {
            let isActive
            isActive = match.path == to

            return (
                <div className={classNames('navtab', 'navtab--' + (isActive ? 'active' : 'inactive'))}>
                  { this.props.label &&
                    <div className="navtab__label-wrapper">
                      <div className={classNames('navtab__label', 'navtab__label--' + (isActive ? 'active' : 'inactive'))}>
                        <Link to={to}>
                          {this.props.label}
                        </Link>
                      </div>
                    </div>
                  }
                  { !this.props.label &&
                    <Link to={to}>{children}</Link>
                  }
                </div>
            )
        } else if (variant === 'dashboard-toggle') {
            return (
                <div className={classNames('navtab', 'navtab--' + (this.props.expanded ? 'expanded' : 'collapsed'))}>
                    <div className="navtab__label-wrapper">
                        <div className={classNames('navtab__label', 'navtab__label--inactive')}>{this.props.label}&nbsp;</div>
                        <div className="navtab__icon"><i className="material-icons">{this.props.expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</i></div>
                    </div>
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const { } = state

    return {
        variant: props.variant || 'link',
    }
}

export default connect(mapStateToProps)(withRouter(NavTab))
