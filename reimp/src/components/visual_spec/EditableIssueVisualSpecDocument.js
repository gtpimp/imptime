import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from '../form/EditableProperty'
import { getIssue } from '../../actions/Issues'
import VisualSpecDocumentForm from './VisualSpecDocumentForm'
import VisualSpecDocumentGalleryImage from './VisualSpecDocumentGalleryImage'
import Blank from '../form/Blank'
import {browserHistory} from 'react-router'

class EditableIssueVisualSpecDocument extends Component {

    constructor(props) {
        super(props)
        this.onDelete = this.onDelete.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onOpen = this.onOpen.bind(this)
    }

    onChange() {
        // do nothing, the file has already been uploaded by the
        // VisualSpecDocumentForm
    }

    onDelete() {
        const { dispatch, issue_id, visual_spec_document_id, onDeleteDocument } = this.props
        onDeleteDocument(visual_spec_document_id)
    }

    onOpen() {
        const {visual_spec_document, visual_spec_document_id, project_id, sprint_id, issue_id} = this.props
        if ( issue_id ) {
            browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + issue_id + '/visualSpec/' + visual_spec_document.id);
        }
    }

    render() {
        const {issue_id, project_id, visual_spec_document, visual_spec_document_id,
               selectDocument, reorderDocuments, is_active} = this.props

	return (

            <EditableProperty property_key={'issue_visual_spec_document_'+visual_spec_document_id}
                              initial_value={visual_spec_document}
                              class_name="issue_visual_spec_document__editable_property"
                              can_edit={true}
                              onChange={this.onChange}
            >
            <VisualSpecDocumentForm issue_id={issue_id} project_id={project_id}
            visual_spec_document={visual_spec_document}
            onDelete={this.onDelete}
            onOpen={this.onOpen} />
            <div>
            <div className="icon--edit"/>
              </div>
              <Blank />
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, project_id, visual_spec_document_id,
            selectDocument, onDeleteDocument, reorderDocuments, is_active } = props
    const issue = getIssue(state, issue_id) || {}
    let visual_spec_document = { id: visual_spec_document_id || null}
    map(issue.visual_spec_documents || [], function(issue_visual_spec_document, index) {
        if ( issue_visual_spec_document.id === visual_spec_document_id ) {
            visual_spec_document = issue_visual_spec_document
        }
    })
    
    return {
        issue_id: issue_id,
        project_id: project_id,
        sprint_id: issue.sprint_id,
        visual_spec_document_id: visual_spec_document_id,
        visual_spec_document: visual_spec_document,
        selectDocument,
        onDeleteDocument,
        reorderDocuments,
        is_active
    }
}


export default connect(mapStateToProps)(EditableIssueVisualSpecDocument)
