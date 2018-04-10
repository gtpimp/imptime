import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/maintenance.css'
import { isMaintenanceModeActive } from '../actions/Maintenance'

class Maintenance extends Component {

    constructor(props) {
        super(props)
        this.onReload=this.onReload.bind(this)
    }

    onReload() {
        window.location.reload()
    }
    
    render() {
        const { maintenance_mode_active } = this.props
        if ( ! maintenance_mode_active ) {
            return null
        }
        return (
            <div className="maintenance--active">
              <div className="maintenance__header">
                ImpTime is currently in maintenance mode
              </div>
              <div className="maintenance__instructions">
                The site will remain responsive so that you can copy any unsaved information, but it will not save or load.
              </div>
              <button className="maintenance__reload-button button button--large button--primary" onClick={this.onReload}>Reload</button>
            </div>
        )
    }
}

function mapStateToProps(state) {

    const maintenance_mode_active = isMaintenanceModeActive(state)
    
    return {
        maintenance_mode_active
    }
}

export default connect(mapStateToProps)(Maintenance)
