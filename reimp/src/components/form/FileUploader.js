import React, {Component} from 'react'
import {connect} from 'react-redux'
import { populateDefaultRequestHeaders } from '../../actions/lib'
import DropzoneComponent from 'react-dropzone-component';

class FileUploader extends Component {

    render() {

        const { upload_url, onSuccess, onFailure, upload_params, request_headers } = this.props

        const componentConfig = {
            iconFiletypes: [],
            showFiletypeIcon: true,
            postUrl: upload_url
        }

        const djsConfig = {
            params: upload_params,
            headers: request_headers
        }

        const eventHandlers = {
            init: (dropzone) => { this.dropzone = dropzone },
            error: onFailure,
            success: onSuccess,
            complete: (f) => this.dropzone.removeFile(f)
        }

        return (
            <DropzoneComponent config={componentConfig}
                               eventHandlers={eventHandlers}
                               djsConfig={djsConfig} />
        )
    }
}

function mapStateToProps(state, props) {
    const { upload_relative_url, upload_params, onSuccess, onFailure } = props

    const request_headers = {}
    populateDefaultRequestHeaders(request_headers)

    const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
    const upload_url = API_BASE_URL + upload_relative_url

    return {
        upload_url,
        upload_params,
        request_headers,
        onSuccess,
        onFailure
    }
}

export default connect(mapStateToProps)(FileUploader)
