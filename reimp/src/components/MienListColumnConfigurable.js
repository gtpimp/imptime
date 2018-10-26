import React, {Component} from 'react'
import {connect} from 'react-redux'
import { size, filter } from 'lodash'
import ListColumnConfigurer from './ListColumnConfigurer'
import {
    isMienConfigurerActive,
    getMienBeingConfigured,
    updateMienHeaders,
    getHeaderListForCurrentMien
} from '../actions/Mien'

class MienListColumnConfigurable extends Component {

    constructor(props) {
        super(props)
        this.onListColumnConfigurerSaved = this.onListColumnConfigurerSaved.bind(this)
    }
    
    onListColumnConfigurerSaved(new_active_headers) {
        const { dispatch, mien_being_configured, header_list_name } = this.props
        dispatch(updateMienHeaders(mien_being_configured.id, header_list_name, new_active_headers))
    }

    renderListColumnConfigurer() {
        const { mien_being_configured, header_list_name, active_headers, all_headers } = this.props
        if ( ! mien_being_configured ) {
            return null
        }
        return (
            <ListColumnConfigurer all_headers={all_headers}
                                  onSave={this.onListColumnConfigurerSaved}
                                  name={header_list_name}
                                  active_headers={active_headers} />
        )
    }
    
    render() {
        const { is_mien_configurer_active, active_headers } = this.props

        if ( is_mien_configurer_active ) {
            return this.renderListColumnConfigurer()
        } else {
            return this.props.children({active_headers})
        }
    }
}

function mapStateToProps(state, props) {
    
    const { all_headers, header_list_name } = props

    const is_mien_configurer_active = isMienConfigurerActive(state)
    const mien_being_configured = getMienBeingConfigured(state)
    let active_headers = getHeaderListForCurrentMien(mien_being_configured, header_list_name)
    if ( size(active_headers) === 0 ) {
        active_headers = filter(all_headers, (header) => header.is_default === true)
    }
    if ( size(active_headers) === 0 ) {
        active_headers = all_headers
    }
    
    return {
        is_mien_configurer_active,
        mien_being_configured,
        header_list_name,
        active_headers,
        all_headers
    }
}

export default connect(mapStateToProps)(MienListColumnConfigurable)
