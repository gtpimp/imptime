import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import { getVisualSpecDocuments, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import Gallery from 'react-photo-gallery';

class VisualSpecDocumentGallery extends Component {
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
        const { dispatch, visual_spec_document_ids } = props
        dispatch(ensureVisualSpecDocumentsLoaded(visual_spec_document_ids))
    }

    render() {
        const { image_set } = this.props
        return (
            <Gallery photos={image_set} />
        )
    }
    
}

function mapStateToProps(state, props) {

    const { visual_spec_document_ids } = props

    const visual_spec_documents = getVisualSpecDocuments(state, visual_spec_document_ids) || []
    const image_set = map(visual_spec_documents, function(vsd) {
        return {
            src: vsd.preview_url,
            width: vsd.hires_width,
            height: vsd.hires_height,
            srcset: "vsd.hires_url " + vsd.hires_width + "w, " +
                    "vsd.lores_url " + vsd.hires_width/2 + "w, " +
                    "vsd.preview_url 100w"
        }
    })
    
    return {
        image_set
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentGallery)
