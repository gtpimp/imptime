import React, { Component } from 'react'
import { connect } from 'react-redux'
import {DndTypes} from '../../actions/Dnd'
import {DragSource} from 'react-dnd';
import classNames from 'classnames'
import '../../sass/visual-spec.scss'
import ToolTip from 'react-portal-tooltip'
import {
    updateVisualSpecAnnotation,
    createVisualSpecAnnotation,
    deleteVisualSpecAnnotation
} from '../../actions/VisualSpecAnnotations'

class VisualSpecAnnotationDragLayer extends Component {
    render() {
        return (
            <div>Dragging</div>
        )
    }
}

class VisualSpecAnnotation extends Component {

    state = {
        isTooltipActive: false
    }

    constructor(props) {
        super(props)
        this.showTooltip = this.showTooltip.bind(this)
        this.hideTooltip = this.hideTooltip.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
    }

    showTooltip() {
        const { tooltips_enabled } = this.props
        if ( tooltips_enabled ) {
            this.setState({isTooltipActive: true})
        }
    }

    hideTooltip() {
        const { tooltips_enabled } = this.props
        if ( tooltips_enabled ) {
            this.setState({isTooltipActive: false})
        }
    }

    createVisualSpecAnnotation({annotated_visual_spec_document_id, visual_spec_annotation_id, shape, x_pos, y_pos}) {
        const { dispatch } = this.props
        dispatch(createVisualSpecAnnotation(annotated_visual_spec_document_id, {shape, x_pos, y_pos}))
    }

    updateVisualSpecAnnotation({annotated_visual_spec_document_id, visual_spec_annotation_id, shape, x_pos, y_pos}) {
        const { dispatch } = this.props
        dispatch(updateVisualSpecAnnotation(annotated_visual_spec_document_id, 
                                            [visual_spec_annotation_id],
                                            {shape, x_pos, y_pos}))
    }

    deleteVisualSpecAnnotation(visual_spec_issue_annotation_id) {
        const { dispatch } = this.props
        dispatch(deleteVisualSpecAnnotation(visual_spec_issue_annotation_id))
    }

    render() {
        const { visual_spec_annotation, isDragging, connectDragSource,
                shape, tooltips_enabled, annotation_size_px,
                container_img_size} = this.props
        const { isTooltipActive } = this.state

        let offset = { width: 0, height: 0 }
        if ( visual_spec_annotation.id && container_img_size ) {
            if ( container_img_size.width > 0 && container_img_size.height > 0 ) {
                offset = { x:(annotation_size_px * visual_spec_annotation.x_offset_to_target / container_img_size.width),
                           y: (annotation_size_px * visual_spec_annotation.y_offset_to_target / container_img_size.height) }
            }
        }

        const container_style = {}
        if ( !isDragging && visual_spec_annotation.x_pos ) {
            if ( visual_spec_annotation.y_pos > 100 ) {
                visual_spec_annotation.y_pos = 90
            }
            if ( visual_spec_annotation.x_pos > 100 ) {
                visual_spec_annotation.x_pos = 90
            }

            container_style.left = (visual_spec_annotation.x_pos - offset.x) + "%"
            container_style.top = (visual_spec_annotation.y_pos - offset.y) + "%"

        }
        const annotation_style = {}
        annotation_style.backgroundSize = annotation_size_px + "px"
        annotation_style.width = annotation_size_px + "px"
        annotation_style.height = annotation_size_px + "px"

        const tooltip_target_id = (tooltips_enabled && "visual_spec_annotation_"+visual_spec_annotation.id) || "dummy_vsia_"+visual_spec_annotation.id

        return (
            <div>

              {connectDragSource(
                   <div id={tooltip_target_id}
                        key={(visual_spec_annotation.id) || "empty"}
                        ref={(element) => { this.tooltip_parent = element }}
                        className={classNames("visual-spec",
                                              {"visual-spec--dragging": isDragging,
                                               "visual-spec--empty": !visual_spec_annotation.id})}
                        style={container_style}
                   >
                     { ! visual_spec_annotation.id &&
                       <div className={classNames("visual-spec__image--"+shape)}
                            style={annotation_style}
                       >
                       </div>
                     }

                     { visual_spec_annotation.id &&
                       <div onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
                         <div className={classNames("visual-spec__image--"+shape)}
                              style={annotation_style}
                         >
                         </div>
                       </div>
                     }
                   </div>
               )}

               { visual_spec_annotation.id && !isDragging && tooltips_enabled &&
                 <ToolTip active={isTooltipActive}
                          position="right"
                          arrow="center"
                          parent={tooltip_target_id}>
                   <div className="visual-spec--tooltip">
                     {/* <EditableIssueTitle issue_id={issue.id} />
                     <EditableIssueDescription issue_id={issue.id} />
                     <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
                     <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
                     <EditableIssueEstimate issue_id={issue.id} /> */}
                   </div>
                 </ToolTip>
               }

            { false && isDragging && <VisualSpecAnnotationDragLayer {...this.props} /> }

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_annotation, default_shape,
            can_edit, annotation_size_px, tooltips_enabled,
            container_img_element_unique_id } = props
    // const visual_spec_issue_annotation = getVisualSpecIssueAnnotation(state, visual_spec_issue_annotation_id) || {}
    const is_invalidated = false // is_visual_spec_issue_annotation_invalidated(state, visual_spec_issue_annotation_id)
    const container_img_element = (container_img_element_unique_id && document.getElementById(container_img_element_unique_id)) || null
    const container_img_size = (container_img_element && container_img_element.getBoundingClientRect()) || { width:0, height:0 }

    return {
        visual_spec_annotation: visual_spec_annotation || {},
        is_invalidated: is_invalidated || false,
        shape: (visual_spec_annotation && visual_spec_annotation.shape) || default_shape || "circle",
        can_edit: can_edit !== false,
        annotation_size_px: annotation_size_px || 60,
        tooltips_enabled: tooltips_enabled !== false,
        container_img_size
    }
}

const headingSource = {
    beginDrag(props, monitor, component) {
        return {
            id: (props.visual_spec_annotation && props.visual_spec_annotation.id) || "new"
        }
    },
    endDrag(props, monitor, component) {
        const { visual_spec_annotation,
                onDelete, shape, can_edit } = props
        if ( ! can_edit ) {
            return
        }
        const drop_result = monitor.getDropResult()
        if ( drop_result === null ) {
            if ( visual_spec_annotation.id && onDelete ) {
                component.deleteVisualSpecAnnotation({visual_spec_annotation_id:visual_spec_annotation.id})
            }
            return
        }
        const { annotated_visual_spec_document_id, child_pos, parent_pos, distance_moved } = drop_result
        let x_pos
        let y_pos
        if ( props.visual_spec_annotation && props.visual_spec_annotation.id ) {
            x_pos = visual_spec_annotation.x_pos + (100*distance_moved.x / parent_pos.width) //-
                    //(annotation_size_px * visual_spec_annotation.x_offset_to_target / parent_pos.width)
            y_pos = visual_spec_annotation.y_pos + (100*distance_moved.y / parent_pos.height) //-
            //(annotation_size_px * visual_spec_annotation.y_offset_to_target / parent_pos.height)

            component.updateVisualSpecAnnotation({annotated_visual_spec_document_id,
                                                  visual_spec_annotation_id: visual_spec_annotation.id,
                                                  shape,
                                                  x_pos,
                                                  y_pos})
            
        } else {
            x_pos = 100*(child_pos.x-parent_pos.left)/ parent_pos.width
            y_pos = 100*(child_pos.y-parent_pos.top)/ parent_pos.height
            component.createVisualSpecAnnotation({annotated_visual_spec_document_id,
                                                  shape: shape,
                                                  x_pos: x_pos,
                                                  y_pos: y_pos})
        }
    }
}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

//export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ANNOTATION, headingSource, collect)(DragLayer(dragLayer)(VisualSpecIssueAnnotation)))
export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ANNOTATION, headingSource, collect)(VisualSpecAnnotation))
