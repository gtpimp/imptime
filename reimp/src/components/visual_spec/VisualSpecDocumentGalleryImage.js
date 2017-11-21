import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import {DragSource, DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'
import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import VisualSpecIssueAnnotation from './VisualSpecIssueAnnotation'
import {
    ensureVisualSpecIssueAnnotationsLoaded,
    getVisualSpecIssueAnnotations,
    createVisualSpecIssueAnnotation,
    updateVisualSpecIssueAnnotation
} from '../../actions/VisualSpecIssueAnnotations'

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
        const { dispatch, visual_spec_document_id, issue_id_for_annotations, visual_spec_issue_annotation_ids } = props
        dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
        if ( issue_id_for_annotations ) {
            dispatch(ensureIssuesLoaded(issue_id_for_annotations))
        }
        if ( visual_spec_issue_annotation_ids ) {
            dispatch(ensureVisualSpecIssueAnnotationsLoaded(visual_spec_issue_annotation_ids))
        }
    }

    render() {
        const { visual_spec_document_id, image_url, is_active, isOver, isDragging,
                connectDragSource, connectDropTarget, onSelected, visual_spec_issue_annotation_ids } = this.props
        const that = this

        if ( isDragging ) {
            return null
        }
        
        return connectDragSource(connectDropTarget(
            <div className="visual-spec-document-gallery-image__container" key={visual_spec_document_id}>
              <img className={classNames("visual_spec_document_gallery__image",
                                         {"visual_spec_document_gallery__image--selected": is_active,
                                          "visual_spec_document_gallery__image--dnd-target": isOver
                                         })}
                   
                   src={image_url}
                   onClick={onSelected} />


              { map(visual_spec_issue_annotation_ids, (visual_spec_issue_annotation_id) => {
                    return (
                        <VisualSpecIssueAnnotation key={visual_spec_issue_annotation_id}
                                                   can_edit={false}
                                                   size="small"
                                                   visual_spec_issue_annotation_id={visual_spec_issue_annotation_id} />
                    )
                })
              }              
            </div>
        ))
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id, is_active, onSelected, issue_id_for_annotations } = props
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || []
    const issue = (issue_id_for_annotations && getIssue(state, issue_id_for_annotations)) || {}
    const visual_spec_annotation_ids_by_doc_id = issue.visual_spec_annotation_ids_by_doc_id || {}
    const visual_spec_issue_annotation_ids = visual_spec_annotation_ids_by_doc_id[visual_spec_document_id] || []
    const visual_spec_issue_annotations = getVisualSpecIssueAnnotations(state, visual_spec_issue_annotation_ids) || []
    
    return {
        image_url: visual_spec_document.preview_url,
        visual_spec_document_id,
        is_active,
        onSelected,
        visual_spec_issue_annotation_ids,
        visual_spec_issue_annotations,
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
        props.onReorder(dragging_visual_spec_document_id, visual_spec_document_id)
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
    }
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_DOCUMENT, headingSource, collect)(DropTarget(DndTypes.VISUAL_SPEC_DOCUMENT, headingTarget, collectDrop)(VisualSpecDocumentGalleryImage)))
