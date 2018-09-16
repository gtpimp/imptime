import React, {Component} from 'react'
import { size, map } from 'lodash'
import { AutoSizer, Table, Column } from 'react-virtualized'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import 'react-virtualized/styles.css';

class CommonTable extends Component {

    render() {
        const { getAvailableHeaders, getHeaderListForMien, updateMienHeaders, header_list_name,
                items, header_list, renderCell } = this.props

        return (

            <div>
              <MienListColumnConfigurable getAvailableHeaders={getAvailableHeaders}
                                          getHeaderListForMien={getHeaderListForMien}
                                          updateMienHeaders={updateMienHeaders}
                                          header_list_name={header_list_name}
              >

                <AutoSizer disableHeight>
                  {({width}) => (
                       <Table height={500}
                              headerHeight={20}
                              rowCount={size(items)}
                              rowHeight={30}
                              width={width}
                              rowGetter={({ index }) => items[index]}
                       >
                         { map(header_list, (header) =>
                             <Column key={header.key}
                                     label={header.label}
                                     dataKey={header.key}
                                     cellRenderer={renderCell}
                                     flexGrow={1}
                                     width={100} />
                           )}
                       </Table>
                   )}
                </AutoSizer>
                
              </MienListColumnConfigurable>
            </div>
        )        
        
    }
    
}

export default CommonTable
