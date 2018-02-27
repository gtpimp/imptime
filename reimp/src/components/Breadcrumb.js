import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import '../sass/breadcrumb.css'
class Breadcrumb extends Component {

    render() {
        const {label, to, is_last } = this.props
        return (
            <div className="breadcrumb">
              <Link to={to}>{label}</Link>
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
