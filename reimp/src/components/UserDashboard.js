import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import '../sass/user-dashboard.css'
import { logout } from '../actions/Auth'

class UserDashboard extends Component {

    constructor(props) {
        super(props)
        this.onLogout = this.onLogout.bind(this)
    }

    onLogout() {
        const { dispatch } = this.props
        dispatch(logout())
    }

    onChangePassword() {
        browserHistory.push('/password/change')
    }

    onShowReleaseNotes() {
        browserHistory.push('/release_notes')
    }

    render() {

        return (
            <div className="user-dashboard button">
                <button className="button--primary button--large" onClick={this.onLogout}>Logout</button>
                <button className="button--primary button--large" onClick={this.onChangePassword}>Change password</button>
                <button className="button--primary button--large" onClick={this.onShowReleaseNotes}>Release notes</button>

            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(UserDashboard)
