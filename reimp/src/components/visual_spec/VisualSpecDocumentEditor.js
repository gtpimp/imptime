import React, { Component } from 'react'
import { connect } from 'react-redux'
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
        const { visual_spec_document_id, visual_spec_document } = this.props
        
        if ( ! visual_spec_document_id ) {
            return null
        }

        return (
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


export default connect(mapStateToProps)(VisualSpecDocumentEditor)
