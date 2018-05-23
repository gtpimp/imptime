import React, {Component} from 'react'
import {connect} from 'react-redux'
import ListColumnConfigurer from './ListColumnConfigurer'
import {
    isMienConfigurerActive,
    getMienBeingConfigured
} from '../actions/Mien'

class MienListColumnConfigurable extends Component {

    constructor(props) {
        super(props)
        this.onListColumnConfigurerSaved = this.onListColumnConfigurerSaved.bind(this)
    }
    
    onListColumnConfigurerSaved(new_active_headers) {
        const { dispatch, mien_being_configured, updateMienHeaders } = this.props
        dispatch(updateMienHeaders(mien_being_configured.id, new_active_headers))
    }

    renderListColumnConfigurer() {
        const { mien_being_configured, getAvailableHeaders, getHeaderListForMien, header_list_name } = this.props
        if ( ! mien_being_configured ) {
            return null
        }
        return (
            <ListColumnConfigurer all_headers={getAvailableHeaders()}
                                  onSave={this.onListColumnConfigurerSaved}
                                  name={header_list_name}
                                  active_headers={getHeaderListForMien(mien_being_configured)} />
        )
    }
    
    render() {
        const { is_mien_configurer_active } = this.props

        return (
            <div>
              { is_mien_configurer_active && this.renderListColumnConfigurer() }
              { !is_mien_configurer_active && this.props.children }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { getAvailableHeaders, getHeaderListForMien, updateMienHeaders, header_list_name } = props

    const is_mien_configurer_active = isMienConfigurerActive(state)
    const mien_being_configured = getMienBeingConfigured(state)
    
    return {
        is_mien_configurer_active,
        mien_being_configured,
        getAvailableHeaders,
        updateMienHeaders,
        getHeaderListForMien,
        header_list_name
    }
}

export default connect(mapStateToProps)(MienListColumnConfigurable)
