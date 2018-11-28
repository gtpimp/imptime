import React, {Component} from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import { getAnnotatedVisualSpecDocument, ensureAnnotatedVisualSpecDocumentsLoaded } from '../../actions/AnnotatedVisualSpecDocuments'
import { cx, css } from 'emotion'
import {default_theme as theme} from '../../theme/default'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecAnnotationToolbar from './VisualSpecAnnotationToolbar'
import VisualSpecToolbar from './VisualSpecToolbar'
import VisualSpecDocumentGalleryFullScreen from './VisualSpecDocumentGalleryFullScreen'

const header_height = 36;

class VisualSpecDocumentGalleryFullScreenPage extends Component {

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

    onKeyPressFullScreen = (evt) => {
        if (evt.keyCode === 27) {
            evt.preventDefault()
            this.onCancelFullScreen()
        }
    }

    onCancelFullScreen = () => {
        const { history } = this.props
        history.goBack()
    }

    render() {
        const { annotated_visual_spec_document_id, visual_spec_document } = this.props
        return (
            <div className={css`position: absolute;
                                top: 0px;
                                left: 0px;
                            `}
                 onKeyDown={this.onKeyPressFullScreen}
                 tabIndex="0"
                 key={annotated_visual_spec_document_id}>
              <div className={css`height: ${header_height}px;
                                  background-color: ${theme.colours.page_background}; 
                                  position: fixed;
                                  padding-left: 12px;
                                  padding-right: 3px;
                                  display: flex;
                                  justify-content: space-between;
                                  align-items: center;
                                  top: 0px;
                                  z-index: 9;
                                  color: ${theme.colours.black};
                                  width:100%;`}>
                  <div className={css`display:flex;`}>
                    {visual_spec_document.name}
                  </div>
                  <div className={css`display: flex; 
                                      align-items: center; `}>
                    <VisualSpecToolbar annotated_visual_spec_document_id={annotated_visual_spec_document_id}
                                       onClose={this.onCancelFullScreen}/>
                    <VisualSpecAnnotationToolbar />
                    <div className={cx("icon--black-close",
                                       css`float: right;
                                       cursor: pointer;`
                        )}
                         onClick={this.onCancelFullScreen} />
                  </div>
              </div>

              <div className={css`margin-top:${header_height}px`}>
                <VisualSpecDocumentGalleryFullScreen annotated_visual_spec_document_id={annotated_visual_spec_document_id} />
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const annotated_visual_spec_document_id = props.match.params.annotatedVisualSpecDocumentId

    const annotated_visual_spec_document = getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id)
    const visual_spec_document = (annotated_visual_spec_document && annotated_visual_spec_document.visual_spec_document) || {}
    
    return {
        annotated_visual_spec_document_id,
        visual_spec_document
    }
}

export default withRouter(connect(mapStateToProps)(VisualSpecDocumentGalleryFullScreenPage))

