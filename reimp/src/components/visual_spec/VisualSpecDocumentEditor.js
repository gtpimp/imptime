import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { map } from 'lodash'
import { connect } from 'react-redux'
import {DndTypes} from '../../actions/Dnd'
import {DropTarget} from 'react-dnd';
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'
import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import '../../sass/visual-spec-document-editor.scss'
import VisualSpecIssueAnnotation from './VisualSpecIssueAnnotation'
import {
    ensureVisualSpecIssueAnnotationsLoaded,
    getVisualSpecIssueAnnotations,
    createVisualSpecIssueAnnotation,
    updateVisualSpecIssueAnnotation
} from '../../actions/VisualSpecIssueAnnotations'

const ANNOTATION_SHAPES = [ "circle", "square", "arrow" ]

class VisualSpecDocumentEditor extends Component {

    constructor(props) {
        super(props)
        this.onVisualSpecDocumentImageLoaded = this.onVisualSpecDocumentImageLoaded.bind(this)
        this.createVisualSpecAnnotation = this.createVisualSpecAnnotation.bind(this)
        this.updateVisualSpecAnnotation = this.updateVisualSpecAnnotation.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
	const { dispatch, visual_spec_document_id, visual_spec_document, issue_id,
                visual_spec_issue_annotation_ids } = props
        
	if ( visual_spec_document_id ) {
	    dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
	}
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded(issue_id))
        }
        if ( visual_spec_issue_annotation_ids ) {
            dispatch(ensureVisualSpecIssueAnnotationsLoaded(visual_spec_issue_annotation_ids))
        }
        if ( !these_props || this.props.visual_spec_document_id != these_props.visual_spec_document_id ) {
            this.setState({visual_spec_document_image_loaded: false})
        }
    }

    onVisualSpecDocumentImageLoaded() {
        this.setState({visual_spec_document_image_loaded: true})
    }

    createVisualSpecAnnotation(params) {
        const { dispatch, visual_spec_document_id, issue_id } = this.props
        dispatch(createVisualSpecIssueAnnotation(visual_spec_document_id, issue_id, params))
    }

    updateVisualSpecAnnotation(visual_spec_issue_annotation_id, params) {
        const { dispatch, visual_spec_document_id, issue_id } = this.props
        dispatch(updateVisualSpecIssueAnnotation(visual_spec_document_id, issue_id,
                                                 [visual_spec_issue_annotation_id], params))
    }

    renderAnnotationToolbar() {
        return (
            <div className="vsd-editor__annotation_toolbar">
              <h1 className="vsd-editor__annotation_toolbar__title">Annotations</h1>
              {map(ANNOTATION_SHAPES, (shape) => (
                   <VisualSpecIssueAnnotation
                       key={shape}
                       visual_spec_issue_annotation_id={null}
                       default_shape={shape}
                       onUpdate={this.updateVisualSpecAnnotation}
                       onCreate={this.createVisualSpecAnnotation}
                   />
               ))}
            </div>
        )
    }

    render() {
        const { visual_spec_document_id, visual_spec_document,
                connectDropTarget, visual_spec_issue_annotation_ids,
                img_element_unique_id } = this.props
        const { visual_spec_document_image_loaded } = this.state || {}
        
        if ( ! visual_spec_document_id ) {
            return null
        }

        return (
            <div className="vsd-editor">

              {connectDropTarget(
                   <div className="vsd-editor__doc_image_container">
                     { visual_spec_document.lores_url &&
                       <img className="vsd-editor__doc_image"
                            role="presentation"
                            id={img_element_unique_id}
                            src={visual_spec_document.lores_url}
                            onLoad={this.onVisualSpecDocumentImageLoaded}
                       />
                     }

                     { !visual_spec_document_image_loaded &&
                       <div className="vsd-editor__image_loading">
                         <h2>Loading Image...</h2>
                       </div>
                     }

                     { visual_spec_document_image_loaded &&
                       map(visual_spec_issue_annotation_ids, (visual_spec_issue_annotation_id) => {
                           return (
                               <VisualSpecIssueAnnotation key={visual_spec_issue_annotation_id}
                                                          onUpdate={this.updateVisualSpecAnnotation}
                                                          onCreate={this.createVisualSpecAnnotation}
                                                          visual_spec_issue_annotation_id={visual_spec_issue_annotation_id} />
                           )
                       })
                     }

                   </div>

                   
               )}

               { this.renderAnnotationToolbar() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id, issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || { 'name': 'loading', 'loaded': false }
    const visual_spec_annotation_ids_by_doc_id = issue.visual_spec_annotation_ids_by_doc_id || {}
    const visual_spec_issue_annotation_ids = visual_spec_annotation_ids_by_doc_id[visual_spec_document_id] || []
    const visual_spec_issue_annotations = getVisualSpecIssueAnnotations(state, visual_spec_issue_annotation_ids) || []
    const img_element_unique_id = "vsd-editor__doc_image__visual_spec_document_id_" + issue_id + "_" + visual_spec_document_id
    
    return {
        visual_spec_document_id,
        visual_spec_document,
        visual_spec_issue_annotation_ids,
        visual_spec_issue_annotations,
        issue_id,
        img_element_unique_id
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {dispatch, visual_spec_document_id, img_element_unique_id} = props 
        const distance_moved = monitor.getDifferenceFromInitialOffset()
        const dragging_item = monitor.getItem()
        const child_pos = monitor.getClientOffset()
        const img_element = document.getElementById(img_element_unique_id)
        const img_size = img_element.getBoundingClientRect()
        return { visual_spec_document_id: visual_spec_document_id,
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

export default connect(mapStateToProps)(DropTarget(DndTypes.VISUAL_SPEC_ISSUE_ANNOTATION, headingTarget, collectDrop)(VisualSpecDocumentEditor))
