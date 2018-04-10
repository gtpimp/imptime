import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from '../form/EditableProperty'
import { getIssue } from '../../actions/Issues'
import VisualSpecDocumentForm from './VisualSpecDocumentForm'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import Blank from '../form/Blank'

class EditableIssueVisualSpecDocument extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onOpen = this.onOpen.bind(this)
    }

    componentDidMount() {
        const { dispatch, visual_spec_document_id } = this.props
        if ( visual_spec_document_id ) {
            dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, visual_spec_document_id } = new_props
        if ( visual_spec_document_id ) {
            dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
        }
    }
    
    onChange() {
        // do nothing, the file has already been uploaded by the
        // VisualSpecDocumentForm
    }

    onDelete() {
        const { visual_spec_document_id, onDeleteDocument } = this.props
        onDeleteDocument(visual_spec_document_id)
    }

    onOpen() {
        const { visual_spec_document_id, onOpenDocument } = this.props
        onOpenDocument(visual_spec_document_id)
    }

    render() {
        const {issue_id, project_id, visual_spec_document, visual_spec_document_id} = this.props

	return (

            <EditableProperty property_key={'issue_visual_spec_document_'+visual_spec_document_id}
                              initial_value={visual_spec_document.id}
                              class_name="issue_visual_spec_document__editable_property"
                              can_edit={true}
                              onChange={this.onChange}
            >
              <VisualSpecDocumentForm issue_id={issue_id} project_id={project_id}
                                      visual_spec_document={visual_spec_document}
                                      onDelete={this.onDelete}
                                      onOpen={this.onOpen} />
              <div className="issue_visual_spec_document__edit">
                <div className="icon--edit"/>
              </div>
              <Blank />
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, project_id, visual_spec_document_id,
            selectDocument, onDeleteDocument, onOpenDocument, reorderDocuments, is_active } = props
    const issue = getIssue(state, issue_id) || {}
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || []
    
    return {
        issue_id: issue_id,
        project_id: project_id,
        sprint_id: issue.sprint_id,
        visual_spec_document_id: visual_spec_document_id,
        visual_spec_document: visual_spec_document,
        selectDocument,
        onDeleteDocument,
        onOpenDocument,
        reorderDocuments,
        is_active
    }
}


export default connect(mapStateToProps)(EditableIssueVisualSpecDocument)
