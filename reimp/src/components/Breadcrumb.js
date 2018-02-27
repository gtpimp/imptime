import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import BreadcrumbMenu from './BreadcrumbMenu'
import '../sass/breadcrumb.css'

class Breadcrumb extends Component {

    constructor(props) {
        super(props)
        this.showBreadCrumbMenu = this.showBreadCrumbMenu.bind(this)
        this.hideBreadCrumbMenu = this.hideBreadCrumbMenu.bind(this)
        this.state = {show_breadcrumbMenu:false}
    }

    showBreadCrumbMenu() {
        const {show_breadcrumbMenu} = this.state
        this.setState({show_breadcrumbMenu:true})
    }

    hideBreadCrumbMenu() {
        const {show_breadcrumbMenu} = this.state
        this.setState({show_breadcrumbMenu:false})
    }
    
    render() {
        const {label, to, is_last } = this.props
        const { show_breadcrumbMenu } = this.state
        return (
            <div className="breadcrumb"
                 onMouseLeave={this.hideBreadCrumbMenu}>
              <Link to={to}
                    onMouseOver={this.showBreadCrumbMenu}>
                {label}
              </Link>
              { show_breadcrumbMenu &&
                <div className="breadcrumb-menu">
                  <BreadcrumbMenu />
                </div>
              }
              { !is_last &&
                <div className="breadcrumb__separator"><i className="material-icons">chevron_right</i></div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { breadcrumb } = props
    return {
        label: breadcrumb.label,
        to: breadcrumb.to
    }
}

export default connect(mapStateToProps)(withRouter(Breadcrumb))
