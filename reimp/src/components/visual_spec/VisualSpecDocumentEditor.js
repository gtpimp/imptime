import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'

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
        const { visual_spec_document_id, visual_spec_document } = this.props
        
        if ( ! visual_spec_document_id ) {
            return null
        }

        return (
            <div>
              Viewing {visual_spec_document_id}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id } = props

    const visual_spec_document = getVisualSpecDocument(visual_spec_document_id) || { 'name': 'loading', 'loaded': false }
    
    return {
        visual_spec_document_id,
        visual_spec_document
    }
}


export default connect(mapStateToProps)(VisualSpecDocumentEditor)
