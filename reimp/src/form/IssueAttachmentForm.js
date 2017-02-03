import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import FileUpload from'react-fileupload'
import { populateDefaultRequestHeaders } from '../actions/lib'


class IssueAttachmentForm extends Component {

    render() {

        const { options, initialValues, handleSubmit, fileUploadOptions } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="attachment">Attachment</label>
                    <FileUpload options={fileUploadOptions}>
                        <button ref="chooseAndUpload">Choose and upload</button>
                    </FileUpload> 
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id } = props
    const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
    const url = API_BASE_URL + "imp/issue/attachment/"

    const requestHeaders = {}
    populateDefaultRequestHeaders(requestHeaders)
    
    const fileUploadOptions = {
        baseUrl:url,
        param:{
            issue_id: issue_id,
        },
        chooseAndUpload: true,
        requestHeaders: requestHeaders,
        withCredentials: true
    }
    
    return {
        initialValues: {attachment:props.initial_value},
        onSubmit: onChange,
        fileUploadOptions: fileUploadOptions
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_attachment_form'})(IssueAttachmentForm))

