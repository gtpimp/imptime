import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, IndexLink, withRouter} from 'react-router'
import classNames from 'classnames'
import '../sass/navtab.css'
class NavTab extends Component {

    render() {
        const {router} = this.props
        const {index, to, children, style, ...props} = this.props

        if (style === 'link') {
            let isActive
            if (router.isActive('/', true) && index) {
                isActive = true
            } else {
                isActive = router.isActive(to)
            }
            const LinkComponent = index ? IndexLink : Link

            return (
                <div className={classNames('navtab', 'navtab--' + (isActive ? 'active' : 'inactive'))}>
                    { this.props.label &&
                    <div className="navtab__label-wrapper">
                        <div className={classNames('navtab__label', 'navtab__label--' + (isActive ? 'active' : 'inactive'))}><LinkComponent to={to} {...props}>{this.props.label}</LinkComponent></div>
                    </div>
                    }
                    { !this.props.label &&
                    <LinkComponent to={to} {...props}>{children}</LinkComponent>
                    }
                </div>
            )
        } else if (style === 'dashboard-toggle') {
            return (
                <div className={classNames('navtab', 'navtab--' + (this.props.expanded ? 'expanded' : 'collapsed'))}>
                    <div className="navtab__label-wrapper">
                        <div className={classNames('navtab__label', 'navtab__label--inactive')}>{this.props.label}</div>
                        <div className="navtab__icon"><i className="material-icons">{this.props.expanded ? 'arrow_drop_up' : 'arrow_drop_down'}</i></div>
                    </div>
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    return {
        style: props.style || 'link'
    }
}


export default connect(mapStateToProps)(withRouter(NavTab))