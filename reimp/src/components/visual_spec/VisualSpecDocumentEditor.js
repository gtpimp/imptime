import React, { Component } from 'react'
import { connect } from 'react-redux'
import {DndTypes} from '../../actions/Dnd'
import {DropTarget} from 'react-dnd';
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'
import '../../sass/visual-spec-document-editor.scss'

class VisualSpecDocumentEditor extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
	      const { dispatch, visual_spec_document_id, visual_spec_document } = this.props
	      if ( visual_spec_document_id && visual_spec_document && visual_spec_document.loaded === false ) {
	          dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
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
        visual_spec_document
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {visual_spec_issue_id} = props
        const dragging_item = monitor.getItem()
        if (!dragging_item) {
            return;
        }
        const dragging_issue_id = dragging_item.id
        if (visual_spec_issue_id === dragging_issue_id) {
            console.log("ignoring dnd on the same element: " + visual_spec_issue_id)
            return;
        }

        alert("the eagle has landed")
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
