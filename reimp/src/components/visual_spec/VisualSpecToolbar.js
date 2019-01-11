import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
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
import new_tab from '../../images/tab_24px.svg'
import { downloadUrl } from '../../actions/Print.js'

class VisualSpecToolbar extends Component {
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
        const { dispatch, annotated_visual_spec_document_id } = props
        dispatch(ensureAnnotatedVisualSpecDocumentsLoaded([annotated_visual_spec_document_id]))
    }

    onDownload = (evt) => {
        const { dispatch, visual_spec_document } = this.props
        evt.preventDefault()
        dispatch(downloadUrl(visual_spec_document.download_url))
    }

    getFullScreenLink = () => {
        const { project_id, annotated_visual_spec_document_id } = this.props
        const fullscreen_url = `/fullscreen/projects/${project_id}/image/${annotated_visual_spec_document_id}`
        return fullscreen_url
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
        const { project_id, new_tab_button } = this.props

        if (!project_id) {
            return null
        }
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
              { new_tab_button && <a href={this.getFullScreenLink()}
                                     target="_blank"
                                     rel="noopener noreferrer">
                <IconButton
                    icon={ new_tab }
                    label="New Tab" />
              </a> }
            </div>
        )

    }
}

function mapStateToProps(state, props) {
    const { annotated_visual_spec_document_id, onClose } = props
    const annotated_visual_spec_document = getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id)
    const visual_spec_document = annotated_visual_spec_document && annotated_visual_spec_document.visual_spec_document
    const project_id = visual_spec_document && ( visual_spec_document.project_ids && visual_spec_document.project_ids[0] )

    return {
        annotated_visual_spec_document_id,
        annotated_visual_spec_document,
        visual_spec_document,
        onClose,
        project_id
    }
}


export default withRouter(connect(mapStateToProps)(VisualSpecToolbar))
