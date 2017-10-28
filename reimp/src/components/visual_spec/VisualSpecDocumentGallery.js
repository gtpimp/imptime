import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {browserHistory} from 'react-router'
import { getVisualSpecDocuments, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'

class VisualSpecDocumentGallery extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh()
        this.selectDocument = this.selectDocument.bind(this)
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_ids } = props
        dispatch(ensureVisualSpecDocumentsLoaded(visual_spec_document_ids))
    }

    selectDocument(event, image) {
        const { dispatch } = this.props
        const vsd = image.visual_spec_document
        browserHistory.push('/projects/' + vsd.project_id + '/sprints/' + vsd.sprint_id + '/issues/' + vsd.issue_id + '/visualSpec/' + vsd.id);
    }

    render() {
        const { image_set } = this.props
        const that = this
        return (
            <div className="visual_spec_document_gallery">
              {map(image_set, function(image) {
                   return <img key={image.visual_spec_document.id}
                               src={image.src}
                               onClick={(event) => that.selectDocument(event, image)} />
               })}
            </div>
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
            visual_spec_document: vsd
        }
    })
    
    return {
        image_set
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentGallery)
