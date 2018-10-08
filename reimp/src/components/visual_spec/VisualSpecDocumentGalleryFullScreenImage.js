import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import { cx, css } from 'emotion'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import {default_theme as theme} from '../../theme/default'
import {DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecAnnotation from './VisualSpecAnnotation'

const ANNOTATION_SHAPES = [ "circle", "square", "arrow" ]

class VisualSpecDocumentGalleryFullScreenImage extends Component {
    constructor(props) {
        super(props)
        this.onVisualSpecDocumentImageLoaded = this.onVisualSpecDocumentImageLoaded.bind(this)
        this.hideVisualSpecDocumentImageLoadingImage = this.hideVisualSpecDocumentImageLoadingImage.bind(this)
        this.onClickDownload = this.onClickDownload.bind(this)
        this.state = { visual_spec_document_image_loaded: false }
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

    onVisualSpecDocumentImageLoaded() {
        this.hideVisualSpecDocumentImageLoadingImage()
    }

    hideVisualSpecDocumentImageLoadingImage() {
        this.setState({visual_spec_document_image_loaded: true})
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
            onCancelFullScreen()
        }
    }

    createVisualSpecAnnotation(params) {
        const { onCreateAnnotation, visual_spec_document_id } = this.props
        if ( onCreateAnnotation ) {
            onCreateAnnotation(visual_spec_document_id, params)
        }
    }

    updateVisualSpecAnnotation(visual_spec_annotation_id, params) {
        const { onUpdateAnnotation, visual_spec_document_id } = this.props
        if ( onUpdateAnnotation ) {
            onUpdateAnnotation(visual_spec_document_id, [visual_spec_annotation_id], params)
        }
    }

    deleteVisualSpecAnnotation(visual_spec_annotation_id) {
        const { onDeleteAnnotation } = this.props
        if ( onDeleteAnnotation ) {
            onDeleteAnnotation(visual_spec_annotation_id)
        }
    }

    renderFullScreenAnnotationToolbar() {
        return (
            <div className={css`display: flex; 
                                cursor: pointer; 
                                margin-right: ${theme.spacing.horizontal_section_gap}`} >
              {map(ANNOTATION_SHAPES, (shape) => (
                   <VisualSpecAnnotation
                       key={shape}
                       visual_spec_annotation={null}
                       default_shape={shape}
                       container_img_element_unique_id={null}
                       annotation_size_px={25}
                       tooltips_enabled={false}
                       onUpdate={this.updateVisualSpecAnnotation}
                       onCreate={this.createVisualSpecAnnotation}
                   />
               ))}
            </div>
        )
    }

    render() {
        const { visual_spec_document, visual_spec_document_id, hires_url,
                show_annotations, connectDropTarget, onCreateAnnotation,
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
                    { show_annotations && onCreateAnnotation && this.renderFullScreenAnnotationToolbar() }
                    <div className={cx("icon--large-cross",
                                       css`float: right;
                                       cursor: pointer;`
                        )}
                         onClick={this.setInlineMode} />
                  </div>
              </div>
              <div className={css`width: 100%; 
                                  height: 100%;
                                  margin-top: 36px;
                                  overflow: auto;
                                  position: relative;
                              `}>
                {connectDropTarget(
                     <div>
                       <img id={img_element_unique_id}
                            src={hires_url}
                            onLoad={this.onVisualSpecDocumentImageLoaded}
                            alt=""
                       />
                       { show_annotations && visual_spec_document_image_loaded && map(visual_spec_annotations, (visual_spec_annotation) => {
                             return (
                                 <VisualSpecAnnotation key={visual_spec_annotation.id}
                                                       can_edit={false}
                                                       container_img_element_unique_id={img_element_unique_id}
                                                       annotation_size_px={25}
                                                       tooltips_enabled={false}
                                                       visual_spec_annotation={visual_spec_annotation} />
                             )
                         })
                       }
                     </div>
                 )}
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id,
            onCancelFullScreen,
            visual_spec_annotations_by_doc_id,
            show_annotations,
            onCreateAnnotation, onUpdateAnnotation, onDeleteAnnotation } = props
    
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || []
    const visual_spec_annotations = visual_spec_annotations_by_doc_id[visual_spec_document_id]
    const img_element_unique_id = "vsd-editor__gallery_image__visual_spec_document_id_" + visual_spec_document_id
    
    return {
        hires_url: visual_spec_document.hires_url,
        download_url: visual_spec_document.download_url,
        visual_spec_document: visual_spec_document,
        visual_spec_annotations,
        visual_spec_document_id,
        onCancelFullScreen,
        img_element_unique_id,
        show_annotations,
        onCreateAnnotation,
        onUpdateAnnotation,
        onDeleteAnnotation
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {visual_spec_document_id, img_element_unique_id} = props 
        const distance_moved = monitor.getDifferenceFromInitialOffset()
        const child_pos = monitor.getClientOffset()
        const img_element = document.getElementById(img_element_unique_id)
        const img_size = img_element.getBoundingClientRect()
        return { visual_spec_document_id: visual_spec_document_id,
                 child_pos: child_pos,
                 distance_moved: distance_moved,
                 parent_pos: img_size }
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

export default connect(mapStateToProps)(DropTarget(DndTypes.VISUAL_SPEC_ANNOTATION, headingTarget, collectDrop)(VisualSpecDocumentGalleryFullScreenImage))
