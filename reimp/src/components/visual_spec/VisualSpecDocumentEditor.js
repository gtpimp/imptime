import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import { map } from 'lodash'
import { connect } from 'react-redux'
import {DndTypes} from '../../actions/Dnd'
import {DropTarget} from 'react-dnd';
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'
import {
    ensureVisualSpecIssuesLoaded
} from '../../actions/VisualSpecIssues'
import { ensureIssuesLoaded } from '../../actions/Issues'
import '../../sass/visual-spec-document-editor.scss'
import VisualSpecIssue from './VisualSpecIssue'

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
        const { visual_spec_document_id, visual_spec_document,
                connectDropTarget, visual_spec_issue_ids } = this.props
        
        if ( ! visual_spec_document_id ) {
            return null
        }

        return connectDropTarget(
            <div className="vsd-editor">

              <div className="vsd-editor__doc_image_container">
                { visual_spec_document.lores_url && <img className="vsd-editor__doc_image"
                                                         role="presentation"
                                                         src={visual_spec_document.lores_url} /> }

                { map(visual_spec_issue_ids, (visual_spec_issue_id) => {
                      return (
                          <VisualSpecIssue key={visual_spec_issue_id}
                                           visual_spec_issue_id={visual_spec_issue_id} />
                      )
                  }) }

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
        const distance_moved = monitor.getDifferenceFromInitialOffset()
        const dragging_item = monitor.getItem()
        const child_pos = monitor.getClientOffset()
        return { visual_spec_document_id: visual_spec_document_id,
                 child_pos: child_pos,
                 distance_moved: distance_moved,
                 parent_pos: ReactDOM.findDOMNode(component).getBoundingClientRect() }
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
