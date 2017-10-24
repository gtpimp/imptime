import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from '../form/EditableProperty'
import { deleteIssueVisualSpecDocument, getIssue } from '../../actions/Issues'
import IssueVisualSpecDocumentForm from './IssueVisualSpecDocumentForm'
import FileLabel from '../form/FileLabel'
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
        // IssueVisualSpecDocumentForm
    }

    onDelete(new_value) {
        const { dispatch, issue_id, visual_spec_document_id } = this.props
        dispatch(deleteIssueVisualSpecDocument(issue_id, visual_spec_document_id))
    }

    onOpen() {
        const {visual_spec_document, project_id} = this.props
        browserHistory.push('/projects/' + project_id + '/visualSpec/' + visual_spec_document.id);
    }

    render() {
        const {issue_id, visual_spec_document} = this.props

	return (

            <div>
                <EditableProperty property_key={'issue_visual_spec_document_'+visual_spec_document.id}
                                  initial_value={visual_spec_document}
                                  can_edit={true}
                                  onChange={this.onChange}
                >
                  <IssueVisualSpecDocumentForm issue_id={issue_id} />
                  <div>
                    { visual_spec_document.id &&
                      <FileLabel value={visual_spec_document}
                                 extra_buttons={[<button onClick={this.onDelete}>delete</button>,
                                                 <button onClick={this.onOpen}>spec</button>]}
                      />
                    }
                    { ! visual_spec_document.id &&
                      <IssueVisualSpecDocumentForm issue_id={issue_id} />
                    }
                  </div>
                  <Blank />
                    
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, visual_spec_document_id } = props
    const issue = getIssue(state, issue_id) || {}
    let visual_spec_document = { id: null}
    map(issue.visual_spec_documents || [], function(issue_visual_spec_document, index) {
        if ( issue_visual_spec_document.id === visual_spec_document_id ) {
            visual_spec_document = issue_visual_spec_document
        }
    })
    
    return {
        issue_id: issue_id,
        project_id: issue.project_id,
        visual_spec_document_id: visual_spec_document_id,
        visual_spec_document: visual_spec_document
    }
}


export default connect(mapStateToProps)(EditableIssueVisualSpecDocument)
