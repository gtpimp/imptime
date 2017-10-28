import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import {browserHistory} from 'react-router'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import {DragSource, DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'

class VisualSpecDocumentGalleryImage extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_id } = props
        dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
    }

    render() {
        const { visual_spec_document_id, image_url, is_active, isOver,
                connectDragSource, connectDropTarget, onSelected } = this.props
        const that = this
        return connectDragSource(connectDropTarget(
            <div key={visual_spec_document_id}>
              <img className={classNames("visual_spec_document_gallery__image",
                                         {"visual_spec_document_gallery__image--selected": is_active,
                                          "visual_spec_document_gallery__image--dnd-target": isOver
                                         })}
                   
                   src={image_url}
                   onClick={onSelected} />
            </div>
        ))
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id, is_active, onSelected } = props
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || []
    
    return {
        image_url: visual_spec_document.preview_url,
        visual_spec_document_id,
        is_active,
        onSelected
    }
}

const headingSource = {
    beginDrag(props) {
        return {id: props.visual_spec_document_id}
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {visual_spec_document_id} = props
        const dragging_item = monitor.getItem()
        if (!dragging_item) {
            return;
        }
        const dragging_visual_spec_document_id = dragging_item.id
        if (visual_spec_document_id === dragging_visual_spec_document_id) {
            console.log("ignoring dnd on the same element: " + visual_spec_document_id)
            return;
        }

        alert("dropped")
        // props.reorderVisual_Spec_Document(dragging_visual_spec_document_id, visual_spec_document_id)
    },
    hover: (props, monitor, component) => {
    },
    canDrop: (props, monitor) => {
        return true;
    }

}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_DOCUMENT, headingSource, collect)(DropTarget(DndTypes.VISUAL_SPEC_DOCUMENT, headingTarget, collectDrop)(VisualSpecDocumentGalleryImage)))
