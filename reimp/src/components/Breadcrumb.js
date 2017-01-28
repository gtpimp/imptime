import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, IndexLink, withRouter} from 'react-router'
import '../sass/breadcrumb.css'
class Breadcrumb extends Component {

    render() {
        const {router, breadcrumb, is_last } = this.props
        const { ...props} = this.props

        return (
            <div className="breadcrumb">
                <Link to={breadcrumb.to} {...props}>{breadcrumb.label}</Link>
                { !is_last &&
                <div className="breadcrumb__separator"><i className="material-icons">chevron_right</i></div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(withRouter(Breadcrumb))