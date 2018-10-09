import React, {Component} from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import map from 'lodash/map'
import { getAnnotatedVisualSpecDocument, ensureAnnotatedVisualSpecDocumentsLoaded } from '../../actions/AnnotatedVisualSpecDocuments'
import { cx, css } from 'emotion'
import {default_theme as theme} from '../../theme/default'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecAnnotationToolbar from './VisualSpecAnnotationToolbar'
import VisualSpecDocumentGalleryFullScreen from './VisualSpecDocumentGalleryFullScreen'

class VisualSpecDocumentGalleryFullScreenImage extends Component {

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
        const { onCancelFullScreen } = this.props
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
              <div className={css`background: linear-gradient(${theme.colours.nav_bar_gradient1}, ${theme.colours.nav_bar_gradient2});
                                  height: 36px;
                                  position: fixed;
                                  padding-left: 12px;
                                  padding-right: 3px;
                                  display: flex;
                                  justify-content: space-between;
                                  align-items: center;
                                  top: 0px;
                                  color: #ffffff;
                                  width:100%;`}>
                  <div>
                    {visual_spec_document.name}
                  </div>
                  <div className={css`display: flex`}>
                    <VisualSpecAnnotationToolbar />
                    <div className={cx("icon--large-cross",
                                       css`float: right;
                                       cursor: pointer;`
                        )}
                         onClick={this.onCancelFullScreen} />
                  </div>
              </div>

              <VisualSpecDocumentGalleryFullScreen annotated_visual_spec_document_id={annotated_visual_spec_document_id} />
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

export default withRouter(connect(mapStateToProps)(VisualSpecDocumentGalleryFullScreenImage))

