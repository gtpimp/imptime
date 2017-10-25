import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form'
import FileUploader from '../form/FileUploader'

class IssueVisualSpecDocumentForm extends Component {

    render() {
        const { upload_relative_url, issue_id, onChange } = this.props
        return (
            <div>
              <label htmlFor="visual_spec_document">Visual spec document</label>
              <FileUploader upload_relative_url={upload_relative_url}
                            upload_params={{issue_id: issue_id}}
                            onSuccess={onChange}
                            onFailure={onChange}
              />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id } = props
    const upload_relative_url = 'imp/visual_spec_document/'
    
    return {
        onSubmit: onChange,
        upload_relative_url,
        issue_id: issue_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_visual_spec_document_form'})(IssueVisualSpecDocumentForm))
