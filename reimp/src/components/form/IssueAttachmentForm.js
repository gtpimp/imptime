import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form'
import FileUploader from './FileUploader'

class IssueAttachmentForm extends Component {

    render() {

        const { upload_relative_url, requestHeaders, issue_id } = this.props
        
        return (
            <div>
              <label htmlFor="attachment">Attachment</label>
              <FileUploader upload_relative_url={upload_relative_url}
                            upload_params={{issue_id: issue_id}} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id } = props
    const upload_relative_url = 'imp/issue/attachment/'
    
    return {
        onSubmit: onChange,
        upload_relative_url: upload_relative_url,
        issue_id: issue_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_attachment_form'})(IssueAttachmentForm))
