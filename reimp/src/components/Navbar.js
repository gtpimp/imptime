import React, {Component} from 'react'
import {connect} from 'react-redux'
import SearchBox from '../components/SearchBox'
import {logged_in_user} from '../actions/Auth'
import '../sass/navbar.css'
import classNames from 'classnames'
import NavTab from './NavTab'

class Navbar extends Component {

    constructor(props) {
        super(props)
        this.toggleUserDashboard = this.toggleUserDashboard.bind(this)
    }

    toggleUserDashboard() {
        console.log('toggle the user dashboard')
    }

    render() {

        const {username} = this.props
        const is_dashboard_expanded = true

        return (
            <div className="navbar">
                <div className="navbar__left">
                    <NavTab to="/" index={true}>
                        <div className="navbar__component navbar__branding">
                            &nbsp;
                        </div>
                    </NavTab>
                    <div className="navbar__component navbar__search"><SearchBox/></div>
                </div>
                <div className="navbar__right">
                    <div className="navbar__tab"><NavTab to="/projects" label="Projects" /></div>
                    <div className="navbar__tab"><NavTab to="/clients" label="Clients"/></div>
                    <div className="navbar__tab"><NavTab to="/team" label="Team" /></div>
                    <div className="navbar__tab" onClick={this.toggleUserDashboard}><NavTab style="dashboard-toggle" expanded={is_dashboard_expanded} label={username} /></div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
        username: logged_in_user(state).username
    }
}

export default connect(mapStateToProps)(Navbar)
