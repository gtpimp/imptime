import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import {browserHistory} from 'react-router'
import { getVisualSpecDocuments,
         ensureVisualSpecDocumentsLoaded
} from '../../actions/VisualSpecDocuments'
import EditableIssueVisualSpecDocument from './EditableIssueVisualSpecDocument'
import VisualSpecDocumentGalleryImage from './VisualSpecDocumentGalleryImage'
import VisualSpecDocumentForm from './VisualSpecDocumentForm'
import FileUploader from '../form/FileUploader'
import '../../sass/visual-spec-document-gallery.scss'

class VisualSpecDocumentGallery extends Component {
    constructor(props) {
        super(props)
        this.selectDocument = this.selectDocument.bind(this)
        this.reorderDocuments  = this.reorderDocuments.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_ids } = props
        dispatch(ensureVisualSpecDocumentsLoaded(visual_spec_document_ids))
    }

    reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id) {
        const {dispatch, reorderDocuments} = this.props
        reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id)
    }

    selectDocument(event, visual_spec_document) {
        const { dispatch, onSelect } = this.props
        const vsd = visual_spec_document
        if ( onSelect ){
            onSelect(vsd.id)
        } else {
            browserHistory.push('/visualSpec/' + vsd.id);
        }
    }

    render() {
        const { image_set, active_visual_spec_document_id, connectDragSource, connectDropTarget,
                issue_id, project_id, allow_edit, onDeleteDocument } = this.props
        const that = this
        return (
            <div className="visual_spec_document_gallery">
              {map(image_set, function(image, index) {
              return (
              <div key={image.visual_spec_document.id}>
                <VisualSpecDocumentGalleryImage visual_spec_document_id={image.visual_spec_document.id}
                                                onReorder={that.reorderDocuments}
                                                is_active={active_visual_spec_document_id===image.visual_spec_document.id}
                                                onSelected={(event) => that.selectDocument(event, image.visual_spec_document)} />
                { allow_edit &&
                  <EditableIssueVisualSpecDocument issue_id={issue_id}
                                                   project_id={project_id}
                                                   onDeleteDocument={onDeleteDocument}
                                                   visual_spec_document_id={image.visual_spec_document.id} />
                }
              </div>
              )
              })}
              { allow_edit && 
              <VisualSpecDocumentForm issue_id={issue_id}
                                      project_id={project_id}
                                      onChange={()=>{}}
              />
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { visual_spec_document_ids, active_visual_spec_document_id, reorderDocuments,
            issue_id, project_id, allow_edit, onSelect, onDeleteDocument } = props

    const visual_spec_documents = getVisualSpecDocuments(state, visual_spec_document_ids) || []
    const image_set = map(visual_spec_documents, function(vsd) {
        return {
            src: vsd.preview_url,
            width: vsd.hires_width,
            height: vsd.hires_height,
            visual_spec_document: vsd
        }
    })
    
    return {
        image_set,
        active_visual_spec_document_id,
        visual_spec_document_ids,
        reorderDocuments,
        project_id,
        allow_edit: allow_edit !== false,
        onSelect,
        onDeleteDocument
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentGallery)
