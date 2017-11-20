import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { populateDefaultRequestHeaders } from '../../actions/lib'
import FileUploadProgress  from 'react-fileupload-progress';

class FileUploader extends Component {

    constructor(props) {
        super(props)
        this.beforeSend = this.beforeSend.bind(this)
        this.formCustomizer = this.formCustomizer.bind(this)
    }
    
    beforeSend(request) {
        const { request_headers } = this.props
        map(request_headers, (v, k) => {
            request.setRequestHeader(k, v);
        })
        return request
    }

    formCustomizer(form) {
        const { upload_params } = this.props
        map(upload_params, (v, k) => {
            form.append(k, v)
        })
        return form
    }
    
    render() {

        const { upload_url, onSuccess, onFailure } = this.props
        
        return (

            <FileUploadProgress key="upload_url"
                                url={upload_url}
                                beforeSend={this.beforeSend}
                                onError={onFailure}
                                onLoad={onSuccess}
                                onAbort={onFailure}
                                formCustomizer={this.formCustomizer} />
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
