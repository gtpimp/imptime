import React, {Component} from 'react'
import { includes, keyBy, size, map } from 'lodash'
import {connect} from 'react-redux'
import Draggable from 'react-draggable'
import { findDOMNode } from 'react-dom'
import { AutoSizer, defaultTableHeaderRenderer, defaultTableRowRenderer, Column, Table } from 'react-virtualized'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { updateMienHeaders, getCurrentMienId } from '../actions/Mien'
import 'react-virtualized/styles.css';

const SortableTable = SortableContainer(Table, {
    withRef: true
})
const SortableRow = SortableElement(defaultTableRowRenderer)
const DragHandle = SortableHandle(({ label }) => (
    <div>{label}</div>
))

const MIN_COLUMN_WIDTH = 30

class CommonTable extends Component {

    onRowSorted = (args) => {
        const {newIndex, oldIndex} = args
        const { onRowReordered } = this.props
        if (newIndex === oldIndex) {
            return
        }

        if ( onRowReordered ) {
            onRowReordered(oldIndex, newIndex)
        }
        this.forceUpdate()
    }

    onRowClicked = ({event, rowData}) => {
        const { onRowSelected } = this.props
        onRowSelected(event, rowData.id)
    }

    rowRenderer = (args) => {
        const { index,  } = args
        const { selected_item_ids, items } = this.props
        const is_selected = includes(selected_item_ids, items[index].id)

        if ( is_selected ) {
            args.className += " common-table__row--selected"
        }
        args.className += " common-table__row"
        return this.isRowSortable(index)
             ? <SortableRow {...args} />
             : defaultTableRowRenderer(args)
    }

    resizeColumn = ({ dataKey, deltaX }) => {
        const { dispatch, header_list, header_list_name, mien_id } = this.props
        const header = keyBy(header_list, "key")[dataKey]
        header.flexGrow = 0
        header.flexShrink = 0
        header.width = ""+Math.max(MIN_COLUMN_WIDTH, parseInt(header.width.replace("px",""), 10) + deltaX)+"px"

        dispatch(updateMienHeaders(mien_id, header_list_name, header_list))
    }

    isRowSortable = (index) => {
        const { onRowReordered } = this.props
        return index >= 0 && onRowReordered !== undefined
    }

    renderDraggableColumn = (args) => {
        const { rowIndex } = args
        const { renderCell } = this.props
        const content = renderCell(args)
        if (this.isRowSortable(rowIndex)) {
            return <DragHandle label={content} />
        } else { 
            return content
        }
    }

    renderDraggableHeader = (args) => {
        return (
            <div className='DraggableHeader'>
              {defaultTableHeaderRenderer(args)}
              <Draggable
                  axis='x'
                  defaultClassName='DragHandle'
                  defaultClassNameDragging='DragHandleActive'
                  onStop={(event, data) => this.resizeColumn({
                          dataKey: args.dataKey,
                          deltaX: args.x
                  })}
                  position={{
                      x: 0,
                      y: 0
                  }}
                  zIndex={999}
              >
                <div>||</div>
              </Draggable>
            </div>
        )
    }    
    
    render() {
        const { getAvailableHeaders, getHeaderListForMien, updateMienHeaders, header_list_name,
                items, header_list, table_params } = this.props

        return (

            <MienListColumnConfigurable getAvailableHeaders={getAvailableHeaders}
                                        getHeaderListForMien={getHeaderListForMien}
                                        updateMienHeaders={updateMienHeaders}
                                        header_list_name={header_list_name}
            >

              <div className="common-table">
                <AutoSizer>
                  {({width, height}) => (
                      <SortableTable getContainer={(wrappedInstance) => findDOMNode(wrappedInstance.Grid)}
                                     height={table_params.height || height} 
                                     headerHeight={40}
                                     rowCount={size(items)}
                                     onRowClick={this.onRowClicked}
                                     onSortEnd={this.onRowSorted}
                                     distance={5}
                                     rowHeight={30}
                                     width={width}
                                     useDragHandle
                                     rowRenderer={this.rowRenderer}
                                     rowGetter={({ index }) => items[index]}
                          >
                        { map(header_list, (header) =>
                            <Column key={header.key}
                                    headerClassName="common-table__header__column"
                                    label={header.label}
                                    dataKey={header.key}
                            //headerRenderer={this.renderDraggableHeader}
                                    cellRenderer={this.renderDraggableColumn}
                                    flexGrow={parseInt(header.flex || 0, 10)}
                                    flexShrink={parseInt(header.flex || 0, 10)}
                                    width={Math.max((header.width && parseInt(header.width.replace("px",""), 10)) || 200, MIN_COLUMN_WIDTH)} />
                        )}
                      </SortableTable>
                  )}
                </AutoSizer>
              </div>
              
            </MienListColumnConfigurable>
        )        
        
    }
}

function mapStateToProps(state, props) {
    
    const { getAvailableHeaders, getHeaderListForMien, updateMienHeaders, header_list_name,
            renderCell,
            selected_item_ids, onRowSelected, onRowReordered, items, header_list,
            table_params } = props

    const mien_id = getCurrentMienId(state)
    
    return {
        getAvailableHeaders,
        getHeaderListForMien,
        updateMienHeaders,
        onRowSelected,
        onRowReordered,
        renderCell,
        header_list_name,
        items,
        selected_item_ids,
        header_list,
        mien_id,
        table_params: table_params || {}
    }
}

export default connect(mapStateToProps)(CommonTable)

