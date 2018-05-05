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
    
    updateIssueHeaderConfiguration(event, header_key, enabled) {
        event.stopPropagation()
        /* const { mien_being_configured } = this.props
         * const all_headers = getAllAvailableIssueHeaders()
         * var issue_headers = mien_being_configured.issue_headers
         * map(keys(all_headers), function(header_key) {
         *     
         * })
         * dispatch(updateMienIssueHeaders(mien_being_configured.id, issue_headers))*/
    }

    onDragEnd(result) {
        const { onSave } = this.props
        const { mien, all_headers } = this.props
        
        /* const { onReorder } = this.props
         * if (!result.destination) {
         *     return;
         * }
         * if ( ! onReorder ) {
         *     return;
         * }
         * const index_of_row_being_moved = result.source.index
         * const index_of_destination = result.destination.index
         * onReorder(index_of_row_being_moved, index_of_destination)*/
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
        const { mien, active_headers, all_headers } = this.props

        const inactive_headers = filter(all_headers, (header) => !includes(active_headers, header))
        
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
    
    return {
        mien,
        onSave,
        all_headers,
        active_headers
    }
}

export default connect(mapStateToProps)(ListColumnConfigurer)
