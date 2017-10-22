import React, { Component } from 'react'
import { connect } from 'react-redux'
import {DndTypes} from '../../actions/Dnd'
import {DropTarget} from 'react-dnd';
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'
import {
    ensureVisualSpecIssuesLoaded,
    createVisualSpecIssue,
    updateVisualSpecIssue
} from '../../actions/VisualSpecIssues'
import { ensureIssuesLoaded } from '../../actions/Issues'
import '../../sass/visual-spec-document-editor.scss'

class VisualSpecDocumentEditor extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
	const { dispatch, visual_spec_document_id, visual_spec_document, visual_spec_issue_ids } = props
	if ( visual_spec_document_id && visual_spec_document && visual_spec_document.loaded === false ) {
	    dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
	}
        if ( visual_spec_issue_ids ) {
            dispatch(ensureVisualSpecIssuesLoaded(visual_spec_issue_ids))
        }
        if ( visual_spec_document && visual_spec_document.issue_ids ) {
            dispatch(ensureIssuesLoaded(visual_spec_document.issue_ids))
        }
    }

    render() {
        const { visual_spec_document_id, visual_spec_document, connectDropTarget } = this.props
        
        if ( ! visual_spec_document_id ) {
            return null
        }

        return connectDropTarget(
            <div className="vsd-editor">

              Viewing {visual_spec_document_id}

              <div className="vsd-editor__doc_image_container">
                { visual_spec_document.image_url && <img className="vsd-editor__doc_image"
                                                         role="presentation"
                                                         src={visual_spec_document.image_url} /> }
              </div>
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id } = props

    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || { 'name': 'loading', 'loaded': false }
    
    return {
        visual_spec_document_id,
        visual_spec_document,
        visual_spec_issue_ids: visual_spec_document.visual_spec_issue_ids
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {dispatch, visual_spec_document_id} = props
        const dragging_item = monitor.getItem()
        if (!dragging_item) {
            return;
        }
        const dragging_visual_issue_id = dragging_item.id
        if ( dragging_visual_issue_id == "new" ) {
            dispatch(createVisualSpecIssue(visual_spec_document_id, "pointer", 100, 100))
        } else {
            dispatch(updateVisualSpecIssue([dragging_visual_issue_id], "pointer", 100, 100))
        }
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


export default connect(mapStateToProps)(DropTarget(DndTypes.VISUAL_SPEC_ISSUE, headingTarget, collectDrop)(VisualSpecDocumentEditor))
