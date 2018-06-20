import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import NavTab from '../NavTab'
// import '../../sass/navbar.css'

class ReadOnlyNavbar extends Component {

    render() {

        const {is_loading, is_saving, is_websockets_connected} = this.props
        const user_initiated_network_activity = is_loading || is_saving
        return (
            <div className={classNames('navbar', 'navbar--network-' + ( user_initiated_network_activity ? 'active' : 'inactive' ))}>
                <div className="navbar__left">
                    <NavTab to="/" index={true}>
                        <div className={classNames('navbar__component', 'navbar__branding', 'navbar__branding--' +(is_websockets_connected ? 'connected' : 'disconnected'))}>
                        </div>
                    </NavTab>
                    <div>
                      <h2>ImpTime - Sharing</h2>
                    </div>

                </div>
                <div className="navbar__right">
                  <div className="navbar__tab"><NavTab to="/" label="Login" /></div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const loading = state.loading
    const websockets = state.websockets || {}
    return {
        is_loading: loading.is_loading,
        is_saving: loading.is_saving,
        is_websockets_connected: websockets.isConnected,
    }
}

export default connect(mapStateToProps)(ReadOnlyNavbar)
