import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
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
        const { dispatch } = this.props
        dispatch(logout())
    }

    onChangePassword() {
        browserHistory.push('/password/change')
    }

    onShowReleaseNotesEditor() {
        browserHistory.push('/release_notes_editor')
    }

    render() {
        const { has_edit_release_notes_permission } = this.props

        return (
            <div className="user-dashboard button">
                <button className="button--primary button--large" onClick={this.onLogout}>Logout</button>
                <button className="button--primary button--large" onClick={this.onChangePassword}>Change password</button>

                { has_edit_release_notes_permission &&
                  <button className="button--primary button--large" onClick={this.onShowReleaseNotesEditor}>Release notes</button>
                }

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

export default connect(mapStateToProps)(UserDashboard)
