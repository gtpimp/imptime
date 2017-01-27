import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import '../sass/user-dashboard.css'

class UserDashboard extends Component {

    render() {

        return (
            <div className="user-dashboard">
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(UserDashboard)
