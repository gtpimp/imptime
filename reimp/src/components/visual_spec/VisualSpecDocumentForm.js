import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form'
import FileUploader from '../form/FileUploader'
import FileLabel from '../form/FileLabel'
import { UPLOAD_RELATIVE_URL } from '../../actions/VisualSpecDocuments'

class VisualSpecDocumentForm extends Component {

    render() {
        const { issue_id, project_id,
                onChange, onDelete, onOpen, visual_spec_document } = this.props

        const upload_params = {project_id: project_id}
        if ( issue_id ) {
            upload_params.issue_id = issue_id
        }
        
        return (
            <div>
              <label htmlFor="visual_spec_document">Visual spec document</label>
              <FileUploader upload_relative_url={UPLOAD_RELATIVE_URL}
                            upload_params={upload_params}
                            onSuccess={onChange}
                            onFailure={onChange}
              />
              { visual_spec_document && visual_spec_document.id &&
                <FileLabel value={visual_spec_document}
                           extra_buttons={[<button onClick={onDelete}>delete</button>,
                                           <button onClick={onOpen}>spec</button>]} />
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id, project_id, onDelete,
            onOpen, visual_spec_document } = props
    
    return {
        onSubmit: onChange,
        visual_spec_document,
        issue_id,
        project_id,
        onDelete,
        onOpen
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_visual_spec_document_form'})(VisualSpecDocumentForm))
