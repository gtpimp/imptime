import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {withRouter} from 'react-router-dom'
import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import { getVisualSpecDocuments,
         ensureVisualSpecDocumentsLoaded
} from '../../actions/VisualSpecDocuments'
import EditableIssueVisualSpecDocument from './EditableIssueVisualSpecDocument'
import VisualSpecDocumentGalleryImage from './VisualSpecDocumentGalleryImage'
import VisualSpecDocumentForm from './VisualSpecDocumentForm'
import '../../sass/visual-spec-document-gallery.scss'

class VisualSpecDocumentGallery extends Component {
    constructor(props) {
        super(props)
        this.selectDocument = this.selectDocument.bind(this)
        this.reorderDocuments = this.reorderDocuments.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_ids, issue_id } = props
        dispatch(ensureVisualSpecDocumentsLoaded(visual_spec_document_ids))
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id) {
        const {reorderDocuments} = this.props
        if ( reorderDocuments ) {
            reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id)
        }
    }

    selectDocument(event, visual_spec_document) {
        const { history, onSelect, issue } = this.props
        const vsd = visual_spec_document
        if ( onSelect ){
            onSelect(vsd.id)
        } else {
            if ( issue.id ) {
                history.push('/projects/' + issue.project_id + '/sprints/' + issue.sprint_id + '/issues/' + issue.id + '/visualSpec/' + vsd.id)
            } else {
                history.push('/visualSpec/' + vsd.id)
            }
        }
    }

    render() {
        const { image_set, active_visual_spec_document_id, render_quality, image_class, 
                issue_id, project_id, allow_edit, onDeleteDocument } = this.props
        const that = this
        return (
            <div className="visual_spec_document_gallery">
              {map(image_set, function(image, index) {
                   return (
                       <div key={image.visual_spec_document.id} className="visual_spec_document_gallery__card">
                         <VisualSpecDocumentGalleryImage visual_spec_document_id={image.visual_spec_document.id}
                                                         image_class={image_class}
                                                         issue_id_for_annotations={issue_id}
                                                         onReorder={that.reorderDocuments}
                                                         render_quality={render_quality}
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
            render_quality, image_class,
            issue_id, project_id, allow_edit, onSelect, onDeleteDocument } = props

    const issue = getIssue(state, issue_id) || {}
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
        issue,
        active_visual_spec_document_id,
        visual_spec_document_ids,
        reorderDocuments,
        project_id,
        render_quality,
        image_class,
        allow_edit: allow_edit !== false,
        onSelect,
        onDeleteDocument
    }
}

export default withRouter(connect(mapStateToProps)(VisualSpecDocumentGallery))
