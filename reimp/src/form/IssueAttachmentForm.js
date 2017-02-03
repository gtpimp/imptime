import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import XHRUploader from '../form/XHRUploader'
import { populateDefaultRequestHeaders } from '../actions/lib'


class IssueAttachmentForm extends Component {

    render() {

        const { options, initialValues, handleSubmit, upload_url, requestHeaders } = this.props
        
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="attachment">Attachment</label>
                    <XHRUploader url={upload_url}
                                 auto
                                 headers={requestHeaders}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id } = props
    const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
    const upload_url = API_BASE_URL + "imp/issue/attachment/?issue_id="+issue_id

    const requestHeaders = {}
    populateDefaultRequestHeaders(requestHeaders)
    
    return {
        initialValues: {attachment:props.initial_value},
        onSubmit: onChange,
        upload_url: upload_url,
        requestHeaders: requestHeaders
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_attachment_form'})(IssueAttachmentForm))

