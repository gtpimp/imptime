import React, {Component} from 'react'
import {connect} from 'react-redux'
import { reduxForm } from 'redux-form'
import FileUploader from '../form/FileUploader'
import FileLabel from '../form/FileLabel'
import { UPLOAD_RELATIVE_URL } from '../../actions/VisualSpecDocuments'

class VisualSpecDocumentForm extends Component {

    render() {
        const { issue_id, feature_id, project_id, wiki_id, 
                onChange, onDelete, onCancel, visual_spec_document } = this.props

        const upload_params = {project_id: project_id}

        const extra_buttons = [<button onClick={onCancel}>cancel</button>]
        
        if ( issue_id ) {
            upload_params.issue_id = issue_id
            extra_buttons.push(<button onClick={onDelete}>remove</button>)
        } else if ( feature_id ) {
            upload_params.feature_id = feature_id
            extra_buttons.push(<button onClick={onDelete}>remove</button>)
        } else if ( wiki_id ) {
            upload_params.wiki_id = wiki_id
            extra_buttons.push(<button onClick={onDelete}>remove</button>)
        } else {
            extra_buttons.push(<button onClick={onDelete}>delete</button>)
        }
        
        return (
            <div>
              <FileUploader upload_relative_url={UPLOAD_RELATIVE_URL}
                            upload_params={upload_params}
                            onSuccess={onChange}
                            onFailure={onChange}
              />
              { visual_spec_document && visual_spec_document.id &&
                <FileLabel value={visual_spec_document}
                           extra_buttons={extra_buttons} />
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { onChange, issue_id, feature_id, project_id, wiki_id, onDelete,
            onOpen, onCancel, visual_spec_document } = props
    
    return {
        onSubmit: onChange,
        visual_spec_document,
        issue_id,
        feature_id, 
        project_id,
        wiki_id, 
        onDelete,
        onOpen,
        onCancel
    }
}

export default connect(mapStateToProps)(reduxForm({form:'visual_spec_document_form'})(VisualSpecDocumentForm))
