import React, {Component} from 'react'
import {connect} from 'react-redux'
import NotificationBar from '../components/NotificationBar'
import SearchBox from '../components/SearchBox'
import {logged_in_user} from '../actions/Auth'
import '../sass/navbar.css'
import logo from '../images/Logo@2x.png'
import classNames from 'classnames'

class Navbar extends Component {

    render() {

        const {username} = this.props
        const is_dashboard_expanded = true

        return (
            <div className="navbar">
                <div className="navbar__left">
                    <div className="navbar__component navbar__branding">
                        &nbsp;
                    </div>
                    <div className="navbar__component navbar__search"><SearchBox/></div>
                </div>
                <div className="navbar__right">
                    <div className="navbar__component navbar__tab">
                        <div className="navbar__tab-label">Projects</div>
                    </div>
                    <div className="navbar__component navbar__tab">
                        <div className="navbar__tab-label">Clients</div>
                    </div>
                    <div className="navbar__component navbar__tab">
                        <div className="navbar__tab-label">Team</div>
                    </div>
                    <div className={classNames('navbar__component', 'navbar__tab', 'navbar__tab--account' + (is_dashboard_expanded ? '-expanded' : 'collapsed'))}>
                        <div className="navbar__tab-label">{username}</div>
                        { !is_dashboard_expanded &&
                        <div className="navbar__tab-icon"><i className="material-icons">arrow_drop_down</i></div>
                        }
                        { is_dashboard_expanded &&
                        <div className="navbar__tab-icon"><i className="material-icons">arrow_drop_up</i></div>
                        }
                    </div>
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
