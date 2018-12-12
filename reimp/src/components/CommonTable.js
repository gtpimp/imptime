import React, {Component} from 'react'
import { includes, size, map } from 'lodash'
import {connect} from 'react-redux'
import { findDOMNode } from 'react-dom'
import { AutoSizer, defaultTableRowRenderer, Column, Table } from 'react-virtualized'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import MienListColumnConfigurable from './MienListColumnConfigurable'
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

    constructor(props) {
        super(props)
    }
    
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

    isRowSortable = (index) => {
        const { onRowReordered } = this.props
        return index >= 0 && onRowReordered !== undefined
    }

    renderDraggableColumn = (active_headers, args) => {
        const { rowIndex } = args
        const { renderCell } = this.props
        args.activeHeaders = active_headers
        const content = renderCell(args)
        if (this.isRowSortable(rowIndex)) {
            return <DragHandle label={content} />
        } else { 
            return content
        }
    }
    
    render() {
        const { all_headers, header_list_name, items, table_params } = this.props

        return (

            <MienListColumnConfigurable all_headers={all_headers}
                                        header_list_name={header_list_name}
            >
              {({active_headers}) => (

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
                              { map(active_headers, (header) =>
                                  <Column key={header.key}
                                          headerClassName="common-table__header__column"
                                          label={header.label}
                                          dataKey={header.key}
                                          cellRenderer={(args) => this.renderDraggableColumn(active_headers, args)}
                                          flexGrow={parseInt(header.flex || 0, 10)}
                                          flexShrink={parseInt(header.flex || 0, 10)}
                                          width={Math.max((header.width && parseInt(header.width.replace("px",""), 10)) || 200, MIN_COLUMN_WIDTH)} />
                                )}
                            </SortableTable>
                        )}
                     </AutoSizer>
                   </div>
               )}
              
            </MienListColumnConfigurable>
        )        
        
    }
}

function mapStateToProps(state, props) {
    
    const { header_list_name, renderCell, all_headers, 
            selected_item_ids, onRowSelected, onRowReordered, items,
            table_params } = props

    return {
        onRowSelected,
        onRowReordered,
        renderCell,
        all_headers,
        header_list_name,
        items,
        selected_item_ids,
        table_params: table_params || {}
    }
}

export default connect(mapStateToProps)(CommonTable)

