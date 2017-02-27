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
        browserHistory.push('/password')
    }
    
    render() {

        return (
            <div className="user-dashboard">
                <button onClick={this.onLogout}>Logout</button>
                <button onClick={this.onChangePassword}>Change password</button>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(UserDashboard)
