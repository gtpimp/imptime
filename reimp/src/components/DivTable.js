import React, {Component} from 'react'
import {connect} from 'react-redux'
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
        const index_of_row_being_moved = result.source.index
        const index_of_destination = result.destination.index
        onReorder(index_of_row_being_moved, index_of_destination)
    }
    
    render() {

        return (
            <div className="div-table">
              { this.props.renderHeader &&
                <div className="div-table__header">
                  {this.props.renderHeader()}
                </div>
              }
              <div className="div-table__body">
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                         <div ref={provided.innerRef}
                              className={classNames({"div-table-wrapper--dragging":snapshot.isDragging})}
                         >
                           {map(this.props.children, child => (
                                <Draggable key={child.key} draggableId={child.key}>
                                  {(provided, snapshot) => (
                                       <div>
                                         <div ref={provided.innerRef}
                                              className={classNames({"div-table__row-wrapper--dragging":snapshot.isDragging})}
                                              style={{...provided.draggableStyle}}
                                              {...provided.dragHandleProps}
                                         >
                                           {child}
                                         </div>
                                         {provided.placeholder}
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
    const { onReorder } = props
    return {
        onReorder
    }
}


export default connect(mapStateToProps)(DivTable)
