import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/maintenance.css'
import ModalDialog from '../components/ModalDialog'
import { isMaintenanceModeActive } from '../actions/Maintenance'

class Error extends Component {

    constructor(props) {
        super(props)
        this.onReload=this.onReload.bind(this)
    }

    onReload() {
        window.location.reload()
    }
    
    render() {
        const { has_error, error_message, maintenance_mode_active } = this.props
        if( !has_error || maintenance_mode_active === true ) {
            return null
        }
        return (
            <div className="error-message">
              <ModalDialog isOpen={has_error} title="Imp Down">
                <div>{error_message}</div>
                <button className="error-message__reload-button button button--default button--large" onClick={this.onReload}>
                  Reload
                </button>
              </ModalDialog>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { } = state;

    const notification_bar = state.notification_bar || {}
    const error_message = notification_bar.error_message
    const has_error = error_message && error_message.length && error_message.length > 0
    const maintenance_mode_active = isMaintenanceModeActive(state)
    
    return {
        has_error,
        error_message,
        maintenance_mode_active
    }
}

export default connect(mapStateToProps)(Error)
