import React, {Component} from 'react'
import { includes, size, map, isEmpty, keys, keyBy, union, difference, concat, indexOf } from 'lodash'
import {connect} from 'react-redux'
import { findDOMNode } from 'react-dom'
import { AutoSizer, defaultTableRowRenderer, Column, Table } from 'react-virtualized'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { getTableSizes } from '../actions/commontable'
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
        this.state = {
            table_width: 0,
            table_height: 0 
        }
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
        const { onRowSelected, onRowSelectionUpdated } = this.props
        if ( event ) {
            event.stopPropagation()
        }
        if ( onRowSelected ) {
            onRowSelected(rowData.id)
        }
        const new_selected_ids = this.updateSelection(event, rowData.id)
        if ( onRowSelectionUpdated ) {
            onRowSelectionUpdated(new_selected_ids)
        }
    }

    updateSelection(event, id) {
        const {selected_item_ids} = this.props
        let new_selected_ids = []
        if (event.ctrlKey || event.metaKey) {
            if (includes(selected_item_ids, id)) {
                new_selected_ids = difference(selected_item_ids, [id])
            } else {
                new_selected_ids = union(selected_item_ids, [id])
            }
        } else if (event.shiftKey) {
            new_selected_ids = concat(selected_item_ids, this.findItemsFromHereToAlreadySelected(id))
        } else {
            new_selected_ids = [id]
        }
        return new_selected_ids
    }

    findItemsFromHereToAlreadySelected(target_id) {
        const {selected_item_ids, item_ids} = this.props

        let ids_to_select = []
        let possible_ids_to_select = []
        let running_index = indexOf(item_ids, target_id)
        while(running_index>0 && !includes(selected_item_ids, item_ids[running_index])) {
            possible_ids_to_select.push(item_ids[running_index])
            running_index -= 1
            if ( includes(selected_item_ids, item_ids[running_index]) ) {
                possible_ids_to_select.push(item_ids[running_index])
                ids_to_select = possible_ids_to_select
            }
        }

        if ( ids_to_select.length === 0 ) {
            possible_ids_to_select = []
            running_index = indexOf(item_ids, target_id)
            while(running_index<item_ids.length && !includes(selected_item_ids, item_ids[running_index])) {
                possible_ids_to_select.push(item_ids[running_index])
                running_index += 1
                if ( includes(selected_item_ids, item_ids[running_index]) ) {
                    possible_ids_to_select.push(item_ids[running_index])
                    ids_to_select = possible_ids_to_select
                }
            }
        }
        return ids_to_select
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

    tableResize = (updated_measurements) => {
        const { table_height, table_width } = this.state

        const new_state = getTableSizes(table_height, table_width, updated_measurements)

        if (!isEmpty(new_state)) {
            this.setState(new_state)
        }        
    }
    
    render() {
        const { all_headers, header_list_name, items, table_params } = this.props

        let { table_height, table_width } = this.state
        if ( table_params && table_params.height ) {
            table_height = table_params.height
        }
        if ( table_params && table_params.width ) {
            table_width = table_params.width
        }
        
        return (

            <MienListColumnConfigurable all_headers={all_headers}
                                        header_list_name={header_list_name}
            >
              {({active_headers}) => (

                  <div className="common-table">
                    <AutoSizer onResize={ this.tableResize }>
                      {({width, height}) => (
                          <SortableTable getContainer={(wrappedInstance) => findDOMNode(wrappedInstance.Grid)}
                                         height={ table_height } 
                                         headerHeight={40}
                                         rowCount={size(items)}
                                         onRowClick={this.onRowClicked}
                                         onSortEnd={this.onRowSorted}
                                         distance={5}
                                         rowHeight={30}
                                         width={table_width}
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
            selected_item_ids, onRowSelected, onRowReordered, onRowSelectionUpdated,
            items, table_params } = props

    const item_ids = keys(keyBy(items, 'id'))
    
    return {
        onRowSelected,
        onRowSelectionUpdated,
        onRowReordered,
        renderCell,
        all_headers,
        header_list_name,
        items,
        item_ids,
        selected_item_ids,
        table_params: table_params || {}
    }
}

export default connect(mapStateToProps)(CommonTable)

