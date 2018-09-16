import React, {Component} from 'react'
import { keyBy, size, map } from 'lodash'
import Draggable from 'react-draggable'
import { findDOMNode } from 'react-dom'
import { AutoSizer, defaultTableHeaderRenderer, defaultTableRowRenderer, Column, Table } from 'react-virtualized'
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

const MIN_COLUMN_WIDTH = 50


class CommonTable extends Component {

    onRowSorted = () => {
        window.alert("sorted")
    }

    rowRenderer = (props) => {
        const { index } = props

        return this.isRowSortable(index)
             ? <SortableRow {...props} />
             : defaultTableRowRenderer(props)
    }

    resizeColumn = ({ dataKey, deltaX }) => {
        const { header_list } = this.props
        const header = keyBy(header_list, "key")[dataKey]
        header.flexGrow = 0
        header.flexShrink = 0
        header.width = ""+Math.max(MIN_COLUMN_WIDTH, parseInt(header.width.replace("px",""), 10) + deltaX)+"px"
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

    renderDraggableHeader = (props) => {
        return (
            <div className='DraggableHeader'>
              {defaultTableHeaderRenderer(props)}
              <Draggable
                  axis='x'
                  defaultClassName='DragHandle'
                  defaultClassNameDragging='DragHandleActive'
                  onStop={(event, data) => this.resizeColumn({
                          dataKey: props.dataKey,
                          deltaX: data.x
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

              <AutoSizer>
                {({width, height}) => (
                     <SortableTable getContainer={(wrappedInstance) => findDOMNode(wrappedInstance.Grid)}
                                    height={height}
                                    headerHeight={40}
                                    rowCount={size(items)}
                                    onSortEnd={this.onRowSorted}
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
                                   headerRenderer={this.renderDraggableHeader}
                                   cellRenderer={this.renderDraggableColumn}
                                   flexGrow={header.flex || 0}
                                   flexShrink={header.flex || 0}
                                   width={(header.width && parseInt(header.width.replace("px",""), 10)) || 200} />
                         )}
                     </SortableTable>
                 )}
              </AutoSizer>
              
            </MienListColumnConfigurable>
        )        
        
    }
    
    
}

export default CommonTable
