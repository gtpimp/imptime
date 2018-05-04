import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { keys, map, includes } from 'lodash'
import { getMienBeingConfigured } from '../actions/Mien'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


class ListColumnConfigurer extends Component {

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

    render() {
        const { mien, all_headers } = this.props
        return (
            <div>
              <h3>Configuring issue list for {mien.title}</h3>
              <div className="list_header_configurer">
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                         <div ref={provided.innerRef}
                              className={classNames({"div-table-wrapper--dragging":snapshot.isDragging})}
                         >
                           { map(keys(all_headers), function(header_key) {
                                 const header = all_headers[header_key]
                                 const label = header.description || header.label || header_key.replace(/_/g, " ")
                                 // const is_enabled = includes(keys(mien.issue_headers), header_key)
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
