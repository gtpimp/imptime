import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {withRouter} from 'react-router-dom'
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
    }

    reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id) {
        const {reorderDocuments} = this.props
        if ( reorderDocuments ) {
            reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id)
        }
    }

    selectDocument(event, annotated_visual_spec_document_id) {
        // is this ever called?
        const { history, onSelect, issue } = this.props
        if ( onSelect ){
            onSelect(annotated_visual_spec_document_id)
        } else {
            if ( issue.id ) {
                history.push('/projects/' + issue.project_id + '/sprints/' + issue.sprint_id + '/issues/' + issue.id + '/visualSpec/' + annotated_visual_spec_document_id)
            } else {
                history.push('/visualSpec/' + annotated_visual_spec_document_id)
            }
        }
    }

    render() {
        const { annotated_visual_spec_document_ids, active_annotated_visual_spec_document_id, render_quality, image_class, 
                project_id, allow_edit, show_annotations } = this.props
        const that = this
        return (
            <div className="visual_spec_document_gallery">
              {map(annotated_visual_spec_document_ids, function(annotated_visual_spec_document_id, index) {
                   return (
                       <div key={`vsdg__${annotated_visual_spec_document_id}`}
                            className="visual_spec_document_gallery__card">
                         <VisualSpecDocumentGalleryImage annotated_visual_spec_document_id={annotated_visual_spec_document_id}
                                                         image_class={image_class}
                                                         allow_edit={allow_edit}
                                                         onReorder={that.reorderDocuments}
                                                         render_quality={render_quality}
                                                         show_annotations={show_annotations}
                                                         is_active={active_annotated_visual_spec_document_id===annotated_visual_spec_document_id}
                                                         onSelected={(event) => that.selectDocument(event, annotated_visual_spec_document_id)} />
                       </div>
                   )
               })}
              { allow_edit &&
                <VisualSpecDocumentForm project_id={project_id}
                                        onChange={()=>{}}
                />
              }
              </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { annotated_visual_spec_document_ids, active_annotated_visual_spec_document_id, reorderDocuments,
            render_quality, image_class, show_annotations,
            project_id, allow_edit, onSelect, onDeleteDocument } = props

    return {
        active_annotated_visual_spec_document_id,
        annotated_visual_spec_document_ids,
        reorderDocuments,
        project_id,
        render_quality,
        image_class,
        allow_edit: allow_edit !== false,
        onSelect,
        onDeleteDocument,
        show_annotations: show_annotations || true
    }
}

export default withRouter(connect(mapStateToProps)(VisualSpecDocumentGallery))
