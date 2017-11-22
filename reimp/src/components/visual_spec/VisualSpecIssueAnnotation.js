import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom';
import {DndTypes} from '../../actions/Dnd'
import {DragSource, DragLayer} from 'react-dnd';
import classNames from 'classnames'
import '../../sass/visual-spec-issue.scss'
import { getIssue } from '../../actions/Issues'
import EditableIssueTitle from '../EditableIssueTitle'
import EditableIssueDescription from '../EditableIssueDescription'
import EditableIssueAssignedUser from '../EditableIssueAssignedUser'
import EditableIssueStatus from '../EditableIssueStatus'
import EditableIssueEstimate from '../EditableIssueEstimate'
import ToolTip from 'react-portal-tooltip'
import {
    LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST
} from '../../actions/ItemListKeyRegistry'
import {
    ensureVisualSpecIssueAnnotationsLoaded,
    is_visual_spec_issue_annotation_invalidated,
    getVisualSpecIssueAnnotation
} from '../../actions/VisualSpecIssueAnnotations'
import { highlightItems } from '../../actions/ItemList'

class VisualSpecIssueAnnotationDragLayer extends Component {
    render() {
        return (
            <div>Dragging</div>
        )
    }
}

class VisualSpecIssueAnnotation extends Component {

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
        const props = these_props || this.props
        const { dispatch, visual_spec_issue_annotation_id } = props
        dispatch(ensureVisualSpecIssueAnnotationsLoaded([visual_spec_issue_annotation_id]))
    }

    showTooltip() {
        const { dispatch, issue, tooltips_enabled } = this.props
        if ( tooltips_enabled ) {
            this.setState({isTooltipActive: true})
        }
    }
    
    hideTooltip() {
        const { dispatch, tooltips_enabled } = this.props
        if ( tooltips_enabled ) {
            this.setState({isTooltipActive: false})
        }
    }

    render() {
        const { visual_spec_issue_annotation, isDragging, connectDragSource, connectDragPreview,
                shape, tooltips_enabled, annotation_size_px } = this.props
        const { isTooltipActive } = this.state

        const container_style = {}
        if ( !isDragging && visual_spec_issue_annotation.x_pos ) {
            if ( visual_spec_issue_annotation.y_pos > 100 ) {
                visual_spec_issue_annotation.y_pos = 90
            }
            if ( visual_spec_issue_annotation.x_pos > 100 ) {
                visual_spec_issue_annotation.x_pos = 90
            }

            container_style.top = visual_spec_issue_annotation.y_pos + "%"
            container_style.left = visual_spec_issue_annotation.x_pos + "%"

        }
        const annotation_style = {}
        annotation_style.backgroundSize = annotation_size_px + "px"
        annotation_style.width = annotation_size_px + "px"
        annotation_style.height = annotation_size_px + "px"

        const tooltip_target_id = (tooltips_enabled && "visual_spec_issue_annotation_"+visual_spec_issue_annotation.id) || "dummy_vsia_"+visual_spec_issue_annotation.id

        return ( 
            <div>

              {connectDragSource(
                   <div id={tooltip_target_id}
                        key={visual_spec_issue_annotation.id || "empty"}
                        ref={(element) => { this.tooltip_parent = element }}
                        className={classNames("visual-spec-issue",
                                              {"visual-spec-issue--dragging": isDragging,
                                               "visual-spec-issue--empty": !visual_spec_issue_annotation.id})}
                        style={container_style}
                   >
                     { ! visual_spec_issue_annotation.id &&
                       <div className={classNames("visual-spec-issue__image--"+shape)}
                            style={annotation_style}
                       >
                       </div>
                     }

                     { visual_spec_issue_annotation.id &&
                       <div onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
                         <div className={classNames("visual-spec-issue__image--"+shape)}
                              style={annotation_style}
                         >
                         </div>
                       </div>
                     }
                   </div>
               )}

               { visual_spec_issue_annotation.id && !isDragging && tooltips_enabled &&
                 <ToolTip active={isTooltipActive}
                          position="right"
                          arrow="center"
                          parent={tooltip_target_id}>
                   <div className="visual-spec-issue--tooltip">
                     {/* <EditableIssueTitle issue_id={issue.id} />
                     <EditableIssueDescription issue_id={issue.id} />
                     <EditableIssueAssignedUser issue_ids={[issue.id]} project_id={issue.project_id}/>
                     <EditableIssueStatus issue_ids={[issue.id]} project_id={issue.project_id}/>
                     <EditableIssueEstimate issue_id={issue.id} /> */}
                   </div>
                 </ToolTip>
               }

            { false && isDragging && <VisualSpecIssueAnnotationDragLayer {...this.props} /> }
            
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { visual_spec_issue_annotation_id, default_shape,
            onUpdate, onCreate, can_edit, annotation_size_px, tooltips_enabled} = props
    const visual_spec_issue_annotation = getVisualSpecIssueAnnotation(state, visual_spec_issue_annotation_id) || {}
    const is_invalidated = is_visual_spec_issue_annotation_invalidated(state, visual_spec_issue_annotation_id)
    
    return {
        visual_spec_issue_annotation_id,
        visual_spec_issue_annotation,
        is_invalidated: is_invalidated || false,
        onUpdate,
        onCreate,
        shape: visual_spec_issue_annotation.shape || default_shape || "circle",
        can_edit: can_edit !== false,
        annotation_size_px: annotation_size_px || 60,
        tooltips_enabled: tooltips_enabled !== false
    }
}

const headingSource = {
    beginDrag(props, monitor, component) {
        return {
            id: props.visual_spec_issue_annotation_id || "new"
        }
    },
    endDrag(props, monitor, component) {
        const { visual_spec_issue_annotation, annotation_size_px, onUpdate, onCreate, shape, can_edit } = props
        if ( ! can_edit ) {
            return
        }
        const drop_result = monitor.getDropResult()
        if ( drop_result === null ) {
            return
        }
        const { child_pos, parent_pos, distance_moved } = drop_result
        let x_pos
        let y_pos
        if ( props.visual_spec_issue_annotation_id ) {
            x_pos = visual_spec_issue_annotation.x_pos + (100*distance_moved.x / parent_pos.width)
            y_pos = visual_spec_issue_annotation.y_pos + (100*distance_moved.y / parent_pos.height)
            onUpdate([props.visual_spec_issue_annotation_id], {shape:shape,
                                                               x_pos:x_pos,
                                                               y_pos:y_pos})
        } else {
            x_pos = 100*(child_pos.x-parent_pos.left)/ parent_pos.width
            y_pos = 100*(child_pos.y-parent_pos.top)/ parent_pos.height
            onCreate({shape: shape,
                      x_pos: x_pos,
                      y_pos: y_pos})
        }
    }
}

function dragLayer(monitor, options) {
    return {
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging()
    }
}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

//export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ISSUE_ANNOTATION, headingSource, collect)(DragLayer(dragLayer)(VisualSpecIssueAnnotation)))
export default connect(mapStateToProps)(DragSource(DndTypes.VISUAL_SPEC_ISSUE_ANNOTATION, headingSource, collect)(VisualSpecIssueAnnotation))
