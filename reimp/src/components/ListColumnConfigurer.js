import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { map, includes, filter, keys, keyBy } from 'lodash'
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
                onSave(this.refreshHeaderDefinitions(move_to_active_result.active_headers))
                
            } else if ( destination.droppableId === "inactive_headers" ) {
                // sorting within inactive headers makes no sense
                return
            }
            
        } else if ( source.droppableId === "active_headers" ) {

            if ( destination.droppableId === "inactive_headers" ) {
                const move_to_inactive_result = this.move(active_headers, inactive_headers, source, destination)
                onSave(this.refreshHeaderDefinitions(move_to_inactive_result.active_headers))
            } else if ( destination.droppableId === "active_headers" ) {
                const reordered_active_headers = this.reorder(active_headers, source.index, destination.index)
                onSave(this.refreshHeaderDefinitions(reordered_active_headers))
            }
        }
    }

    refreshHeaderDefinitions(headers) {
        // needed in case a header definition changes in a code release
        const { all_headers } = this.props
        const all_headers_by_key = keyBy(all_headers, "key")
        const refreshed_headers = map(headers, (header) => all_headers_by_key[header.key])
        return refreshed_headers
    }

    renderDraggableList(droppable_key, headers) {
        return (
            <Droppable droppableId={droppable_key}>
              {(provided, snapshot) => (
                   <div ref={provided.innerRef}
                        className={classNames("list-column-configurer__droppable",
                                              {"list-column-configurer__dragging_over":snapshot.isDraggingOver})}
                   >
                     { map(headers, function(header, index) {
                           const header_key = header.key
                           const label = header.description || header.label || (header_key || "unknown").replace(/_/g, " ")
                           return (
                               <Draggable key={header_key}
                                          draggableId={header_key}
                                          index={index}>
                                 {(provided, snapshot) => (
                                        <div ref={provided.innerRef}
                                             className={classNames("list-column-configurer__row",
                                                                   {"list-column-configurer__row--dragging":snapshot.isDragging})}
                                             style={{...provided.draggableProps.style}}
                                             {...provided.dragHandleProps}
                                             {...provided.draggableProps}
                                        >
                                          {label}
                                        </div>
                                  )}
                               </Draggable>
                           )
                       })
                     }
                     {provided.placeholder}
                   </div>
               )}
            </Droppable>
        )
    }

    render() {
        const { mien, active_headers, inactive_headers, name } = this.props

        return (
            <div className="list_column_configurer">
              <h3>Configuring {name} list for {mien.title}</h3>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <div className="list_column_configurer__columns">
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
        )
    }
}

function mapStateToProps(state, props) {
    
    const { onSave, all_headers, active_headers, name } = props
    const mien = getMienBeingConfigured(state)
    const inactive_headers = filter(all_headers, (header) => !includes(keys(keyBy(active_headers, "key")), header.key))
    
    return {
        mien,
        onSave,
        all_headers,
        active_headers: active_headers || [],
        inactive_headers,
        name
    }
}

export default connect(mapStateToProps)(ListColumnConfigurer)
