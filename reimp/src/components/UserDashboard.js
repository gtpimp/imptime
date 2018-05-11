import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../sass/user-dashboard.css'
import { logout } from '../actions/Auth'
import { can_create_release_notes } from '../actions/Auth'

class UserDashboard extends Component {

    constructor(props) {
        super(props)
        this.onLogout = this.onLogout.bind(this)
        this.onChangePassword = this.onChangePassword.bind(this)
        this.onShowReleaseNotesEditor = this.onShowReleaseNotesEditor.bind(this)
    }

    onLogout() {
        const { dispatch, history } = this.props
        dispatch(logout())
        history.push('/')
    }

    onChangePassword() {
        const { history } = this.props
        history.push('/password/change')
    }

    onShowReleaseNotesEditor() {
        const { history } = this.props
        history.push('/release_notes_editor')
    }

    render() {
        const { has_edit_release_notes_permission } = this.props

        return (
            <div className="user-dashboard">
                <div className="user-dashboard-menu-item" onClick={this.onChangePassword}>Edit profile</div>

                { has_edit_release_notes_permission &&
                  <div className="user-dashboard-menu-item" onClick={this.onShowReleaseNotesEditor}>Release notes</div>
                }
                  
                <div className="user-dashboard-menu-item" onClick={this.onLogout}>Logout</div>

            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const has_edit_release_notes_permission = can_create_release_notes(state)
    return {
        has_edit_release_notes_permission
    }
}

export default withRouter(connect(mapStateToProps)(UserDashboard))
