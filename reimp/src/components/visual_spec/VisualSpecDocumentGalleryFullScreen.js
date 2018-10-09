import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getAnnotatedVisualSpecDocument, ensureAnnotatedVisualSpecDocumentsLoaded } from '../../actions/AnnotatedVisualSpecDocuments'
import {DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecDocumentGalleryImage from './VisualSpecDocumentGalleryImage'

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
                                              image_class='visual_spec_document_gallery__image--fullsize'
                                              el_img_element_unique_id={img_element_unique_id}
                                              show_annotations={true} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const annotated_visual_spec_document_id = props.match.params.annotatedVisualSpecDocumentId
    const annotated_visual_spec_document = getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id)
    const visual_spec_document = (annotated_visual_spec_document && annotated_visual_spec_document.visual_spec_document) || {}
    const img_element_unique_id = "vsd-editor__gallery_image__visual_spec_document_id_" + annotated_visual_spec_document_id
    
    return {
        annotated_visual_spec_document_id,
        visual_spec_document,
        img_element_unique_id
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {annotated_visual_spec_document_id, img_element_unique_id} = props 
        const distance_moved = monitor.getDifferenceFromInitialOffset()
        const child_pos = monitor.getClientOffset()
        const img_element = document.getElementById(img_element_unique_id)
        const img_size = img_element.getBoundingClientRect()
        return { annotated_visual_spec_document_id: annotated_visual_spec_document_id,
                 child_pos: child_pos,
                 distance_moved: distance_moved,
                 parent_pos: img_size }
    },
    hover: (props, monitor, component) => {
    },
    canDrop: (props, monitor) => {
        return true;
    }

}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

export default connect(mapStateToProps)(DropTarget(DndTypes.VISUAL_SPEC_ISSUE_ANNOTATION, headingTarget, collectDrop)(VisualSpecDocumentGalleryFullScreenImage))
