import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import { css } from 'emotion'
import classNames from 'classnames'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import {default_theme as theme} from '../../theme/default'
import {DragSource, DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'
// import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import VisualSpecAnnotation from './VisualSpecAnnotation'
import VisualSpecDocumentGalleryFullScreenImage from './VisualSpecDocumentGalleryFullScreenImage'
// import {
//     ensureVisualSpecIssueAnnotationsLoaded,
//     getVisualSpecIssueAnnotations,
// } from '../../actions/VisualSpecIssueAnnotations'

const ANNOTATION_SHAPES = [ "circle", "square", "arrow" ]

class VisualSpecDocumentGalleryImage extends Component {
    constructor(props) {
        super(props)
        this.onVisualSpecDocumentImageLoaded = this.onVisualSpecDocumentImageLoaded.bind(this)
        this.hideVisualSpecDocumentImageLoadingImage = this.hideVisualSpecDocumentImageLoadingImage.bind(this)
        this.onClickDownload = this.onClickDownload.bind(this)
        this.onClickPreview = this.onClickPreview.bind(this)
        this.state = { display_mode: 'inline',
                       visual_spec_document_image_loaded: false }
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document_id,
                // issue_id_for_annotations, visual_spec_annotation_ids
        } = props
        dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
        /* if ( issue_id_for_annotations ) {
         *     dispatch(ensureIssuesLoaded(issue_id_for_annotations))
         * }
         * if ( visual_spec_annotation_ids ) {
         *     dispatch(ensureVisualSpecIssueAnnotationsLoaded(visual_spec_annotation_ids))
         * }*/
    }

    setFullScreenMode = () => {
        this.setState({display_mode:'fullscreen'})
    }

    setInlineMode = () => {
        this.setState({display_mode:'inline'})
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

    onClickPreview(event) {
        event.stopPropagation()
        this.setFullScreenMode()
    }

    onKeyPressFullScreen = (evt) => {
        if (evt.keyCode === 27) {
            evt.preventDefault()
            this.setInlineMode()
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

    resolveThumbnailElement(preview_image_url) {
        const { visual_spec_document, img_element_unique_id, image_class } = this.props
        if ( ! preview_image_url ) {
            return (
                <div id={img_element_unique_id}
                     className={"visual_spec_document_gallery__image " +
                                "icon--loading "}
                />
            )
        }
        if ( preview_image_url.startsWith("no_preview_available__") ) {
            const parts = preview_image_url.split("__")
            const content_type = parts[1].replace("/","-").replace(/\./g,"-")
            return (
                <div id={img_element_unique_id}
                     className={"visual_spec_document_gallery__image " +
                                "visual_spec_document_gallery__image--no-preview"}
                     onClick={this.onClickPreview}
                >
                  {visual_spec_document.name}
                  <div className="visual_spec_document_gallery__image--no-preview--icon">
                    <div className={"icon--contenttype--generic " +
                                    "icon--contenttype--"+content_type}/>
                  </div>
                </div>
            )
        } else {
            const class_name = image_class || "visual_spec_document_gallery__image"
            return (
                <img id={img_element_unique_id}
                     className={class_name}
                     src={preview_image_url}
                     onClick={this.onClickPreview}
                     onLoad={this.onVisualSpecDocumentImageLoaded}
                     alt=""
                />
            )
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
        const { visual_spec_document_id, preview_image_url, is_active, isOver, isDragging,
                visual_spec_annotations_by_doc_id, show_annotations,
                onCreateAnnotation, onUpdateAnnotation, onDeleteAnnotation,
                connectDragSource, connectDropTarget, visual_spec_annotation_ids,
                img_element_unique_id} = this.props
        const { display_mode, visual_spec_document_image_loaded } = this.state

        if ( isDragging ) {
            return null
        }

        const thumbnail_element = this.resolveThumbnailElement(preview_image_url)

        if ( display_mode === 'fullscreen' ) {
            return (
                <VisualSpecDocumentGalleryFullScreenImage visual_spec_document_id={visual_spec_document_id}
                                                          onCancelFullScreen={this.setInlineMode}
                                                          visual_spec_annotations_by_doc_id={visual_spec_annotations_by_doc_id}
                                                          show_annotations={show_annotations}
                                                          onCreateAnnotation={onCreateAnnotation}
                                                          onUpdateAnnotation={onUpdateAnnotation}
                                                          onDeleteAnnotation={onDeleteAnnotation}
                />
            )
        }
        
        return connectDragSource(connectDropTarget(
            <div className="visual-spec-document-gallery-image__container" key={visual_spec_document_id}>
              <div className={classNames("visual-spec-document-gallery-image__img_container",
                                         {"visual_spec_document_gallery__image--selected": is_active,
                                          "visual_spec_document_gallery__image--dnd-target": isOver
                                         })}>
                {thumbnail_element}
                { visual_spec_document_image_loaded && map(visual_spec_annotation_ids, (visual_spec_annotation_id) => {
                      return (
                          <VisualSpecAnnotation key={visual_spec_annotation_id}
                                                can_edit={false}
                                                container_img_element_unique_id={img_element_unique_id}
                                                annotation_size_px={25}
                                                tooltips_enabled={false}
                                                visual_spec_annotation_id={visual_spec_annotation_id} />
                      )
                  })
                }
              </div>

              { false && preview_image_url && !visual_spec_document_image_loaded &&
                <div className="visual_spec_document_gallery__image_loading"
                     onClick={this.hideVisualSpecDocumentImageLoadingImage} >
                  <h2>Loading Image...</h2>
                </div>
              }

              </div>
        ))
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_document_id, is_active, onSelected,
            // issue_id_for_annotations,
            visual_spec_annotations_by_doc_id,
            render_quality, image_class, show_annotations,
            onCreateAnnotation, onUpdateAnnotation, onDeleteAnnotation } = props
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || []
    // const issue = (issue_id_for_annotations && getIssue(state, issue_id_for_annotations)) || {}
    // const visual_spec_annotation_ids_by_doc_id = issue.visual_spec_annotation_ids_by_doc_id || {}
    // const visual_spec_annotation_ids = visual_spec_annotation_ids_by_doc_id[visual_spec_document_id] || []
    // const visual_spec_annotations = getVisualSpecIssueAnnotations(state, visual_spec_annotation_ids) || []

    const visual_spec_annotations = visual_spec_annotations_by_doc_id[visual_spec_document_id]
    const img_element_unique_id = "vsd-editor__gallery_image__visual_spec_document_id_" + visual_spec_document_id
    const preview_url = (render_quality === 'hires' && visual_spec_document.hires_url) || visual_spec_document.preview_url
    
    return {
        preview_image_url: preview_url,
        hires_url: visual_spec_document.hires_url,
        download_url: visual_spec_document.download_url,
        visual_spec_document: visual_spec_document,
        visual_spec_annotations,
        visual_spec_document_id,
        is_active,
        onSelected,
        //visual_spec_annotation_ids,
        img_element_unique_id,
        image_class,
        show_annotations,
        onCreateAnnotation,
        onUpdateAnnotation,
        onDeleteAnnotation
    }
}

const headingSource = {
    beginDrag(props) {
        return {id: props.visual_spec_document_id}
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {visual_spec_document_id} = props
        const dragging_item = monitor.getItem()
        if (!dragging_item) {
            return;
        }
        const dragging_visual_spec_document_id = dragging_item.id
        if (visual_spec_document_id === dragging_visual_spec_document_id) {
            console.log("ignoring dnd on the same element: " + visual_spec_document_id)
            return;
        }
        props.onReorder(dragging_visual_spec_document_id, visual_spec_document_id)
    },
    hover: (props, monitor, component) => {
    },
    canDrop: (props, monitor) => {
        return true;
    }

}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_DOCUMENT, headingSource, collect)(DropTarget(DndTypes.VISUAL_SPEC_DOCUMENT, headingTarget, collectDrop)(VisualSpecDocumentGalleryImage)))
