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
    
    render() {

        return (
            <div className="user-dashboard">
                <button className="button button--primary button--large" onClick={this.onLogout}>Logout</button>
                <button className="button button--primary button--large" onClick={this.onChangePassword}>Change password</button>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(UserDashboard)
