import React, {Component} from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import map from 'lodash/map'
import { cx, css } from 'emotion'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import {default_theme as theme} from '../../theme/default'
import {DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecAnnotationToolbar from './VisualSpecAnnotationToolbar'

class VisualSpecDocumentGalleryFullScreenImage extends Component {
    constructor(props) {
        super(props)
        this.onClickDownload = this.onClickDownload.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_id } = props
        dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
    }

    onClickDownload(event) {
        const { download_url } = this.props
        event.stopPropagation()
        window.open(download_url)
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
        const { visual_spec_document, visual_spec_document_id, hires_url,
                show_annotations, connectDropTarget,
                img_element_unique_id, visual_spec_annotations } = this.props
        const { visual_spec_document_image_loaded } = this.state
        return (
            <div className={css`position: absolute;
                                top: 0px;
                                left: 0px;
                            `}
                 onKeyDown={this.onKeyPressFullScreen}
                 tabIndex="0"
                 key={visual_spec_document_id}>
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
                    { show_annotations && <VisualSpecAnnotationToolbar /> }
                    <div className={cx("icon--large-cross",
                                       css`float: right;
                                       cursor: pointer;`
                        )}
                         onClick={this.setInlineMode} />
                  </div>
              </div>

              <VisualSpecDocumentGalleryImage annotated_visual_spec_document_id={annotated_visual_spec_document_id}
                                              render_quality='hires'
                                              image_class='visual_spec_document_gallery__image--fullsize'
                                              show_annotations={true} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const annotated_visual_spec_document_id = props.match.params.annotatedVisualSpecDocumentId
    
    return {
        annotated_visual_spec_document_id
    }
}

export default withRouter(connect(mapStateToProps)(VisualSpecDocumentGalleryFullScreenImage))
