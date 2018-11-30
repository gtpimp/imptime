import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import map from 'lodash/map'
import {DragSource, DropTarget} from 'react-dnd'
import {DndTypes} from '../../actions/Dnd'
import classNames from 'classnames'
import '../../sass/visual-spec-document-gallery.scss'
import VisualSpecAnnotation from './VisualSpecAnnotation'
import { has_permission } from '../../actions/Users'
import {
    ensureAnnotatedVisualSpecDocumentsLoaded,
    getAnnotatedVisualSpecDocument,
    is_annotated_visual_spec_document_invalidated,
} from '../../actions/AnnotatedVisualSpecDocuments'
import {ensureProjectsLoaded, getProject} from '../../actions/Projects'
import { tokenisedApiUrl } from '../../actions/Print'
import ModalDialog from '../ModalDialog';
import VisualSpecDocumentGalleryFullScreen from './VisualSpecDocumentGalleryFullScreen'
import VisualSpecAnnotationToolbar from './VisualSpecAnnotationToolbar'
import VisualSpecToolbar from './VisualSpecToolbar'
import VisualSpecDocumentPreview from './VisualSpecDocumentPreview'
import { css, cx } from 'emotion'

const DEFAULT_ANNOTATION_SIZE = 25


const preview_toolbar = css`display:flex;
                            align-items:center;`

class VisualSpecDocumentGalleryImage extends Component {
    constructor(props) {
        super(props)
        this.onVisualSpecDocumentImageLoaded = this.onVisualSpecDocumentImageLoaded.bind(this)
        this.hideVisualSpecDocumentImageLoadingImage = this.hideVisualSpecDocumentImageLoadingImage.bind(this)
        this.onClickDownload = this.onClickDownload.bind(this)
        this.onClickPreview = this.onClickPreview.bind(this)
        this.showPreviewModal = this.showPreviewModal.bind(this)
        this.hidePreviewModal = this.hidePreviewModal.bind(this)
        this.renderPreviewModal = this.renderPreviewModal.bind(this)
        this.renderPreviewDocumentButtons = this.renderPreviewDocumentButtons.bind(this)
        this.state = { visual_spec_document_image_loaded: false,
                       show_preview_modal: false}
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, annotated_visual_spec_document_id, project_id } = props
        dispatch(ensureAnnotatedVisualSpecDocumentsLoaded([annotated_visual_spec_document_id]))
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }

    setFullScreenMode = () => {
        const { history, project_id, annotated_visual_spec_document_id } = this.props
        history.push(`/fullscreen/projects/${project_id}/image/${annotated_visual_spec_document_id}`)
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

    renderPreviewModal(preview_image_url) {
        const { annotated_visual_spec_document_id, img_element_unique_id,
                hires_url, visual_spec_document } = this.props

        const { visual_spec_document_image_loaded } = this.state

        return (
            <ModalDialog isOpen={true}
                         variant={"largest"}
                         onClose={this.hidePreviewModal}
                         title={
                             visual_spec_document.name
                         }
                         extra_buttons={
                             this.renderPreviewDocumentButtons(annotated_visual_spec_document_id)
                         }>
              <VisualSpecDocumentPreview hide={this.hidePreviewModal}
                                         show={this.showPreviewModal}
                                         annotated_visual_spec_document_id={annotated_visual_spec_document_id}
                                         onLoad={this.onVisualSpecDocumentImageLoaded}
                                         document={hires_url}
                                         img_id={img_element_unique_id}
                                         documentLoaded={visual_spec_document_image_loaded} />
            </ModalDialog>
        )
    }

    renderPreviewDocumentButtons(annotated_visual_spec_document_id) {
        return (
            <div className={preview_toolbar}>
              <VisualSpecToolbar
                  annotated_visual_spec_document_id={annotated_visual_spec_document_id}
                  onClose={this.hidePreviewModal}/>
              <VisualSpecAnnotationToolbar />
            </div>
        )
    }
    
    showPreviewModal() {
        this.setState({ show_preview_modal: true })
    }

    hidePreviewModal() {
        this.setState({ show_preview_modal: false })
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
        const { visual_spec_document, img_element_unique_id, image_class, is_image,
                content_type, project_id, annotated_visual_spec_document_id } = this.props

        const full_screen_url = `/fullscreen/projects/${project_id}/image/${annotated_visual_spec_document_id}`

        if ( ! preview_image_url ) {
            return (
                <div id={img_element_unique_id}
                     className={"visual_spec_document_gallery__image " +
                                "icon--loading "}
                />
            )
        }
        if ( !is_image ) {
            return (
                <div id={img_element_unique_id}
                     className={"visual_spec_document_gallery__image " +
                                "visual_spec_document_gallery__image--no-preview"}
                     onClick={this.showPreviewModal}
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
                     onLoad={this.onVisualSpecDocumentImageLoaded}
                     alt=""
                     onClick={this.showPreviewModal}
                />
            )
        }
    }

    render() {
        const { annotated_visual_spec_document_id, preview_image_url, is_active, isOver, isDragging,
                visual_spec_annotations, can_edit, annotation_size,
                connectDragSource, connectDropTarget,
                img_element_unique_id} = this.props
        const { visual_spec_document_image_loaded } = this.state

        if ( isDragging ) {
            return null
        }

        const thumbnail_element = this.resolveThumbnailElement(preview_image_url)

        return connectDragSource(connectDropTarget(
            <div className="visual-spec-document-gallery-image__container print__image" key={annotated_visual_spec_document_id}>
              <div className={classNames("visual-spec-document-gallery-image__img_container",
                                         {"visual_spec_document_gallery__image--selected": is_active,
                                          "visual_spec_document_gallery__image--dnd-target": isOver
                                         })}>
                {thumbnail_element}
                { visual_spec_document_image_loaded && map(visual_spec_annotations, (visual_spec_annotation) => {
                      return (
                          <VisualSpecAnnotation key={visual_spec_annotation.id}
                                                can_edit={can_edit}
                                                container_img_element_unique_id={img_element_unique_id}
                                                annotation_size_px={annotation_size}
                                                tooltips_enabled={false}
                                                visual_spec_annotation={visual_spec_annotation} />
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
              { this.state.show_preview_modal && this.renderPreviewModal() }
            </div>
        ))
    }
}

function mapStateToProps(state, props) {
    const { annotated_visual_spec_document_id, is_active, onSelected, allow_edit,
            annotation_size,
            el_img_element_unique_id, render_quality, image_class, show_annotations } = props

    const annotated_visual_spec_document = getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id)
    const visual_spec_document = (annotated_visual_spec_document && annotated_visual_spec_document.visual_spec_document) || {}
    const visual_spec_annotations = annotated_visual_spec_document && annotated_visual_spec_document.annotations
    const img_element_unique_id = el_img_element_unique_id || ("vsd-editor__gallery_image__visual_spec_document_id_" + annotated_visual_spec_document_id)
    const preview_url = (visual_spec_document && ((render_quality === 'hires' && visual_spec_document.hires_url) || visual_spec_document.preview_url)) || null
    const content_type_url = (visual_spec_document && visual_spec_document.preview_url) || null
    const is_image = content_type_url && !content_type_url.startsWith("no_preview_available__")
    const content_type = content_type_url && !is_image && content_type_url.split("__")[1].replace("/","-").replace(/\./g,"-")
    const project_id = visual_spec_document.project_ids && visual_spec_document.project_ids[0]
    const project = project_id && getProject(state, project_id)
    const can_edit = allow_edit !== false && visual_spec_document && visual_spec_document.project_ids && has_permission(state, visual_spec_document.project_ids[0], 'has_edit_issues')
    const is_invalidated = is_annotated_visual_spec_document_invalidated(state, annotated_visual_spec_document_id)
    
    return {
        project,
        project_id,
        preview_image_url: tokenisedApiUrl(state, preview_url),
        hires_url: tokenisedApiUrl(state, visual_spec_document.hires_url),
        medium_res_url: tokenisedApiUrl(state, visual_spec_document.medium_res_url),
        download_url: tokenisedApiUrl(state, visual_spec_document.download_url),
        content_type,
        is_image,
        visual_spec_document: visual_spec_document,
        visual_spec_annotations,
        annotated_visual_spec_document_id,
        is_active,
        onSelected,
        img_element_unique_id,
        image_class,
        show_annotations,
        can_edit,
        is_invalidated,
        annotation_size: annotation_size || DEFAULT_ANNOTATION_SIZE
    }
}

const headingSource = {
    beginDrag(props) {
        return {id: props.annotated_visual_spec_document_id}
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {annotated_visual_spec_document_id} = props
        const dragging_item = monitor.getItem()
        if (!dragging_item) {
            return;
        }
        const dragging_annotated_visual_spec_document_id = dragging_item.id
        if (annotated_visual_spec_document_id === dragging_annotated_visual_spec_document_id) {
            console.log("ignoring dnd on the same element: " + annotated_visual_spec_document_id)
            return;
        }
        props.onReorder(dragging_annotated_visual_spec_document_id, annotated_visual_spec_document_id)
    },
    hover: (props, monitor, component) => {
    },
    canDrop: (props, monitor) => {
        return true;
    }
}

const headingAnnotationTarget = {
    drop: (props, monitor, component) => {
        const {annotated_visual_spec_document_id, img_element_unique_id} = props 
        const distance_moved = monitor.getDifferenceFromInitialOffset()
        const child_pos = monitor.getClientOffset()
        const img_element = document.getElementById(img_element_unique_id)
        const img_size = img_element.getBoundingClientRect()
        return { annotated_visual_spec_document_id: annotated_visual_spec_document_id,
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

export default withRouter(connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_DOCUMENT, headingSource, collect)(DropTarget(DndTypes.VISUAL_SPEC_DOCUMENT, headingTarget, collectDrop)(DropTarget(DndTypes.VISUAL_SPEC_ANNOTATION, headingAnnotationTarget, collectDrop)(VisualSpecDocumentGalleryImage)))))
