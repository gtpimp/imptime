import React, {Component} from 'react'
import {connect} from 'react-redux'
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
    
    render() {

        return (
            <div className="user-dashboard">

                <button onClick={this.onLogout}>Logout</button>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {}
}

export default connect(mapStateToProps)(UserDashboard)
