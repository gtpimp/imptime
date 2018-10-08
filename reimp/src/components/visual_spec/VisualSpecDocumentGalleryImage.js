import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import { cx, css } from 'emotion'
import classNames from 'classnames'
import { getVisualSpecDocument, ensureVisualSpecDocumentsLoaded } from '../../actions/VisualSpecDocuments'
import {default_theme as theme} from '../../theme/default'
import {DragSource, DropTarget} from 'react-dnd';
import {DndTypes} from '../../actions/Dnd'
import '../../sass/visual-spec-document-gallery.scss'
import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import VisualSpecIssueAnnotation from './VisualSpecIssueAnnotation'
import {
    ensureVisualSpecIssueAnnotationsLoaded,
    getVisualSpecIssueAnnotations,
} from '../../actions/VisualSpecIssueAnnotations'

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
        const { dispatch, visual_spec_document_id, issue_id_for_annotations, visual_spec_issue_annotation_ids } = props
        dispatch(ensureVisualSpecDocumentsLoaded([visual_spec_document_id]))
        if ( issue_id_for_annotations ) {
            dispatch(ensureIssuesLoaded(issue_id_for_annotations))
        }
        if ( visual_spec_issue_annotation_ids ) {
            dispatch(ensureVisualSpecIssueAnnotationsLoaded(visual_spec_issue_annotation_ids))
        }
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

    renderFullScreen() {
        const { visual_spec_document, visual_spec_document_id, hires_url, img_element_unique_id } = this.props
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
                  <div className={cx("icon--large-cross",
                                     css`float: right;
                                       cursor: pointer;`
                      )}
                       onClick={this.setInlineMode} />
              </div>
              <div className={css`width: 100%; 
                                  height: 100%;
                                  margin-top: 36px;
                                  overflow: auto;
                              `}>
                <img id={img_element_unique_id}
                     src={hires_url}
                     alt=""
                />
              </div>
            </div>
        )
    }

    render() {
        const { visual_spec_document_id, preview_image_url, is_active, isOver, isDragging,
                connectDragSource, connectDropTarget, visual_spec_issue_annotation_ids,
                img_element_unique_id} = this.props
        const { display_mode, visual_spec_document_image_loaded } = this.state

        if ( isDragging ) {
            return null
        }

        const thumbnail_element = this.resolveThumbnailElement(preview_image_url)

        if ( display_mode === 'fullscreen' ) {
            return this.renderFullScreen()
        }
        
        return connectDragSource(connectDropTarget(
            <div className="visual-spec-document-gallery-image__container" key={visual_spec_document_id}>
              <div className={classNames("visual-spec-document-gallery-image__img_container",
                                         {"visual_spec_document_gallery__image--selected": is_active,
                                          "visual_spec_document_gallery__image--dnd-target": isOver
                                         })}>
                {thumbnail_element}
                { visual_spec_document_image_loaded && map(visual_spec_issue_annotation_ids, (visual_spec_issue_annotation_id) => {
                      return (
                          <VisualSpecIssueAnnotation key={visual_spec_issue_annotation_id}
                                                     can_edit={false}
                                                     container_img_element_unique_id={img_element_unique_id}
                                                     annotation_size_px={25}
                                                     tooltips_enabled={false}
                                                     visual_spec_issue_annotation_id={visual_spec_issue_annotation_id} />
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
    const { visual_spec_document_id, is_active, onSelected, issue_id_for_annotations, render_quality, image_class } = props
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || []
    const issue = (issue_id_for_annotations && getIssue(state, issue_id_for_annotations)) || {}
    const visual_spec_annotation_ids_by_doc_id = issue.visual_spec_annotation_ids_by_doc_id || {}
    const visual_spec_issue_annotation_ids = visual_spec_annotation_ids_by_doc_id[visual_spec_document_id] || []
    const visual_spec_issue_annotations = getVisualSpecIssueAnnotations(state, visual_spec_issue_annotation_ids) || []
    const img_element_unique_id = "vsd-editor__gallery_image__visual_spec_document_id_" + issue_id_for_annotations + "_" + visual_spec_document_id

    const preview_url = (render_quality === 'hires' && visual_spec_document.hires_url) || visual_spec_document.preview_url
    
    return {
        preview_image_url: preview_url,
        hires_url: visual_spec_document.hires_url,
        download_url: visual_spec_document.download_url,
        visual_spec_document: visual_spec_document,
        visual_spec_document_id,
        is_active,
        onSelected,
        visual_spec_issue_annotation_ids,
        visual_spec_issue_annotations,
        img_element_unique_id,
        image_class
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
