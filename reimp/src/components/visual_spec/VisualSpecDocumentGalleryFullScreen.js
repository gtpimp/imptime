import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getAnnotatedVisualSpecDocument, ensureAnnotatedVisualSpecDocumentsLoaded } from '../../actions/AnnotatedVisualSpecDocuments'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecDocumentGalleryImage from './VisualSpecDocumentGalleryImage'

const ANNOTATION_SIZE = 60

class VisualSpecDocumentGalleryFullScreenImage extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, annotated_visual_spec_document_id } = props
        dispatch(ensureAnnotatedVisualSpecDocumentsLoaded([annotated_visual_spec_document_id]))
    }

    render() {
        const { annotated_visual_spec_document_id, img_element_unique_id } = this.props
        return (
            <div>
              <VisualSpecDocumentGalleryImage annotated_visual_spec_document_id={annotated_visual_spec_document_id}
                                              render_quality='hires'
                                              annotation_size={ANNOTATION_SIZE}
                                              image_class='visual_spec_document_gallery__image--fullsize'
                                              el_img_element_unique_id={img_element_unique_id}
                                              show_annotations={true} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { annotated_visual_spec_document_id } = props
    const annotated_visual_spec_document = getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id)
    const visual_spec_document = (annotated_visual_spec_document && annotated_visual_spec_document.visual_spec_document) || {}
    const img_element_unique_id = "vsd-editor__gallery_image__visual_spec_document_id_" + annotated_visual_spec_document_id
    
    return {
        annotated_visual_spec_document_id,
        visual_spec_document,
        img_element_unique_id
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentGalleryFullScreenImage)
