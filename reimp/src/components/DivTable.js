import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { has_permission } from '../actions/Users'
import classNames from 'classnames'
import { map } from 'lodash'
import '../sass/div-table.css'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

class DivTable extends Component {

    constructor(props) {
        super(props)
        this.onDragEnd = this.onDragEnd.bind(this)
    }

    onDragEnd(result) {
        const { onReorder } = this.props
        if (!result.destination) {
            return;
        }
        if ( ! onReorder ) {
            return;
        }
        const index_of_row_being_moved = result.source.index
        const index_of_destination = result.destination.index
        onReorder(index_of_row_being_moved, index_of_destination)
    }
    
    render() {

        const { can_drag, permission_name_for_dragging, project_id } = this.props
        
        return (
            <div className="div-table">
              { this.props.renderHeader &&
                <div className="div-table__header">
                  {this.props.renderHeader()}
                </div>
              }
              <div className="div-table__body">

                { permission_name_for_dragging &&
                  <PermissionInspectorHighlighter project_id={project_id}
                                                  permission_name={permission_name_for_dragging}
                                                  only_show_children_if_panel_is_active={true} >
                    <div className="icon--drag" /> Drag
                  </PermissionInspectorHighlighter>
                }
                
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef}
                             className={classNames({"div-table-wrapper--dragging":snapshot.isDragging})}
                            >
                          {map(this.props.children, (child, index) => (
                              <Draggable key={child.key}
                                         index={index}
                                         draggableId={child.key}
                                         isDragDisabled={!can_drag} >
                                {(provided, snapshot) => (
                                    <div ref={provided.innerRef}
                                         className={classNames({"div-table__row-wrapper--dragging":snapshot.isDragging})}
                                         style={{...provided.draggableProps.style}}
                                         {...provided.dragHandleProps}
                                         {...provided.draggableProps}
                                        >
                                      {child}
                                    </div>
                                )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { onReorder, project_id, permission_name_for_dragging } = props
    const can_drag = !permission_name_for_dragging || has_permission(state, project_id, permission_name_for_dragging)
    return {
        onReorder,
        can_drag,
        permission_name_for_dragging
    }
}


export default connect(mapStateToProps)(DivTable)
