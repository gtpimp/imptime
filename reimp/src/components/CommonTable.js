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
        if (newIndex === oldIndex) {
            return
        }

        this.forceUpdate()
        window.alert("sorted")
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
        return index >= 0
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
                items, header_list } = this.props

        return (

            <MienListColumnConfigurable getAvailableHeaders={getAvailableHeaders}
                                        getHeaderListForMien={getHeaderListForMien}
                                        updateMienHeaders={updateMienHeaders}
                                        header_list_name={header_list_name}
            >

              <div style={{ flex: '1 1 auto' }}>
                <AutoSizer>
                  {({width, height}) => (
                       <SortableTable getContainer={(wrappedInstance) => findDOMNode(wrappedInstance.Grid)}
                                      height={height}
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
                                     label={header.label}
                                     dataKey={header.key}
                                     //headerRenderer={this.renderDraggableHeader}
                                     cellRenderer={this.renderDraggableColumn}
                                     flexGrow={header.flex || 0}
                                     flexShrink={header.flex || 0}
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
            selected_item_ids, onRowSelected, items, header_list } = props

    const mien_id = getCurrentMienId(state)
    
    return {
        getAvailableHeaders,
        getHeaderListForMien,
        updateMienHeaders,
        onRowSelected,
        header_list_name,
        items,
        selected_item_ids,
        header_list,
        mien_id
    }
}

export default connect(mapStateToProps)(CommonTable)

