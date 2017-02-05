import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, IndexLink, withRouter} from 'react-router'
import classNames from 'classnames'
import '../sass/navtab.css'
import without from 'lodash/without'

class NavTab extends Component {

    render() {
        const {router} = this.props
        const {index, to, children, variant} = this.props

        if (variant === 'link') {
            let isActive
            if (router.isActive('/', true) && index) {
                isActive = true
            } else {
                isActive = router.isActive(to)
            }
            const LinkComponent = index ? IndexLink : Link
            const filteredProps = without(this.props, ['router'])

            return (
                <div className={classNames('navtab', 'navtab--' + (isActive ? 'active' : 'inactive'))}>
                    { this.props.label &&
                    <div className="navtab__label-wrapper">
                        <div className={classNames('navtab__label', 'navtab__label--' + (isActive ? 'active' : 'inactive'))}><LinkComponent to={to} {...filteredProps}>{this.props.label}</LinkComponent></div>
                    </div>
                    }
                    { !this.props.label &&
                    <LinkComponent to={to} {...filteredProps}>{children}</LinkComponent>
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
    return {
        variant: props.variant || 'link'
    }
}


export default connect(mapStateToProps)(withRouter(NavTab))