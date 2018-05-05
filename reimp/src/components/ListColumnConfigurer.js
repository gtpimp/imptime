import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { keys, map, includes, filter } from 'lodash'
import { getMienBeingConfigured } from '../actions/Mien'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


class ListColumnConfigurer extends Component {

    constructor(props) {
        super(props)
        this.onDragEnd = this.onDragEnd.bind(this)
    }
    
    move(source, destination, droppableSource, droppableDestination) {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);
        destClone.splice(droppableDestination.index, 0, removed);
        const result = {};
        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;
        return result;
    }

    reorder(list, startIndex, endIndex) {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }

    onDragEnd(result) {
        const { onSave, inactive_headers, active_headers } = this.props
        const { source, destination } = result
        
        if ( ! destination ) {
            return
        }

        if ( source.droppableId === "inactive_headers" ) {

            if ( destination.droppableId === "active_headers" ) {
                const move_to_active_result = this.move(inactive_headers, active_headers, source, destination)
                onSave(move_to_active_result.active_headers)
                
            } else if ( destination.droppableId === "inactive_headers" ) {
                // sorting within inactive headers makes no sense
                return
            }
            
        } else if ( source.droppableId === "active_headers" ) {

            if ( destination.droppableId === "inactive_headers" ) {
                const move_to_inactive_result = this.move(active_headers, inactive_headers, source, destination)
                onSave(move_to_inactive_result.active_headers)
            } else if ( destination.droppableId === "active_headers" ) {
                const reordered_active_headers = this.reorder("active_headers", source.index, destination.index)
                onSave(reordered_active_headers)
            }
        }
    }

    renderDraggableList(droppable_key, headers) {
        return (
            <Droppable droppableId={droppable_key}>
              {(provided, snapshot) => (
                   <div ref={provided.innerRef}
                        className={classNames("list-column-configurer__droppable", {"list-column-configurer__dragging_over":snapshot.isDraggingOver})}
                   >
                     { map(keys(headers), function(header_key) {
                           const header = headers[header_key]
                           const label = header.description || header.label || header_key.replace(/_/g, " ")
                           return (
                               <Draggable key={header_key}
                                          draggableId={header_key}>
                                 {(provided, snapshot) => (
                                      <div>
                                        <div ref={provided.innerRef}
                                             className={classNames("list-column-configurer__row",
                                                                   {"list-column-configurer__row--dragging":snapshot.isDragging})}
                                             style={{...provided.draggableStyle}}
                                             {...provided.dragHandleProps} >
                                          {label}
                                        </div>
                                        {provided.placeholder}
                                      </div>
                                  )}
                               </Draggable>
                           )
                       })
                     }
                   </div>
               )}
            </Droppable>
        )
    }

    render() {
        const { mien, active_headers, inactive_headers } = this.props

        return (
            <div>
              <h3>Configuring issue list for {mien.title}</h3>
              <div className="list_column_configurer">
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <div>
                    <div className="list_column_configurer__headers list_column_configurer__inactive_headers">
                      <h3>Available columns</h3>
                      {this.renderDraggableList("inactive_headers", inactive_headers)}
                    </div>
                    <div className="list_column_configurer__headers list_column_configurer__active_headers">
                      <h3>Active columns</h3>
                      {this.renderDraggableList("active_headers", active_headers)}
                    </div>
                  </div>
                </DragDropContext>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { onSave, all_headers, active_headers } = props
    const mien = getMienBeingConfigured(state)
    const inactive_headers = filter(all_headers, (header) => !includes(active_headers, header))
    
    return {
        mien,
        onSave,
        all_headers,
        active_headers: active_headers || [],
        inactive_headers
    }
}

export default connect(mapStateToProps)(ListColumnConfigurer)
