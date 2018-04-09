import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/maintenance.css'
import { isMaintenanceModeActive } from '../actions/Maintenance'
import { getErrorMessage, clearErrorMessage } from '../actions/Error'

class Error extends Component {

    constructor(props) {
        super(props)
        this.onReload = this.onReload.bind(this)
        this.onClose = this.onClose.bind(this)
    }

    onReload() {
        window.location.reload()
    }
    
    onClose() {
        const { dispatch } = this.props
        dispatch(clearErrorMessage())
        
    }
    
    render() {
        const { has_error, error_message, maintenance_mode_active } = this.props
        if( !has_error || maintenance_mode_active === true ) {
            return null
        }
        return (
            <div className="error--container">
              <div className="error--active">
                <div className="error__header">
                  ImpTime fell over
                  <div className="error--close" onClick={this.onClose} >
                    <div className="icon--small-cross"/>
                  </div>
                </div>
                <div className="error__instructions">
                  {error_message}
                </div>
                <div className="error__instructions">
                  The server admins will be informed and hopefully resolve the problem soon.
                </div>
                <div className="error__instructions">
                  The site will remain responsive so that you can copy any unsaved information, please reload soon to clear this error.
                </div>
                <button className="maintenance__reload-button button button--large button--primary" onClick={this.onReload}>Reload</button>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state) {

    const error_message = getErrorMessage(state)
    const has_error = error_message && error_message.length && error_message.length > 0
    const maintenance_mode_active = isMaintenanceModeActive(state)
    
    return {
        has_error,
        error_message,
        maintenance_mode_active
    }
}

export default connect(mapStateToProps)(Error)
