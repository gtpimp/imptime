import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
    getAnnotatedVisualSpecDocument,
    ensureAnnotatedVisualSpecDocumentsLoaded,
    deleteAnnotatedVisualSpecDocument
} from '../../actions/AnnotatedVisualSpecDocuments'
import { css } from 'emotion'
import {default_theme as theme} from '../../theme/default'
import IconButton from '../IconButton'
import download_icon from '../../images/material-icons-black-download.png'
import delete_icon from '../../images/delete_outline.svg'
import { downloadUrl } from '../../actions/Print.js'

class VisualSpecToolbar extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, annotated_visual_spec_document_id } = props
        dispatch(ensureAnnotatedVisualSpecDocumentsLoaded([annotated_visual_spec_document_id]))
    }

    onDownload = (evt) => {
        const { dispatch, visual_spec_document } = this.props
        evt.preventDefault()
        dispatch(downloadUrl(visual_spec_document.download_url))
    }

    onDelete = (evt) => {
        const { dispatch, annotated_visual_spec_document_id, onClose } = this.props
        evt.preventDefault()
        if (! window.confirm("Are you sure you want to remove this attachment?") ) {
            return false
        }
        dispatch(deleteAnnotatedVisualSpecDocument(annotated_visual_spec_document_id, onClose))
    }
    
    render() {
        return (
            <div className={css`display: flex; 
                                cursor: pointer; 
                                margin-right: ${theme.spacing.horizontal_section_gap},
                                margin-left: ${theme.spacing.horizontal_section_gap}`} >
              <IconButton
                  icon={ download_icon }
                  label="Download"
                  onButtonClick={this.onDownload}/>
              <IconButton
                  icon={ delete_icon }
                  label="Delete"
                  onButtonClick={this.onDelete}/>
            </div>
        )
    }
    
}

function mapStateToProps(state, props) {

    const { annotated_visual_spec_document_id, onClose } = props
    const annotated_visual_spec_document = getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id)
    const visual_spec_document = annotated_visual_spec_document && annotated_visual_spec_document.visual_spec_document
    
    return {
        annotated_visual_spec_document_id,
        annotated_visual_spec_document,
        visual_spec_document,
        onClose
    }
}


export default connect(mapStateToProps)(VisualSpecToolbar)
