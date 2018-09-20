import React, {Component} from 'react'
import {connect} from 'react-redux'
import { AutoSizer } from 'react-virtualized'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { getCurrentMienId } from '../actions/Mien'
import 'react-virtualized/styles.css';
import 'react-virtualized-tree/lib/main.css'
import 'material-icons/css/material-icons.css'
import Tree from 'react-virtualized-tree'

class CommonTree extends Component {

    onNodeClicked = ({event, rowData}) => {
        const { onNodeSelected } = this.props
        onNodeSelected(event, rowData.id)
    }

    render() {
        const { renderNode, getAvailableHeaders,
                getHeaderListForMien, updateMienHeaders, header_list_name, items } = this.props

        return (

            <MienListColumnConfigurable getAvailableHeaders={getAvailableHeaders}
                                        getHeaderListForMien={getHeaderListForMien}
                                        updateMienHeaders={updateMienHeaders}
                                        header_list_name={header_list_name}
            >
              <div>
                <AutoSizer>
                  {({width, height}) => (
                       <Tree nodes={items}
                             onChange={this.onNodeClicked}>
                         {renderNode}
                       </Tree>
                   )}
                </AutoSizer>
              </div>
              
            </MienListColumnConfigurable>
        )        
        
    }
}

function mapStateToProps(state, props) {
    
    const { getAvailableHeaders, getHeaderListForMien, updateMienHeaders, header_list_name,
            selected_item_ids, onNodeSelected, onNodesReordered, items, header_list, renderCell } = props

    const mien_id = getCurrentMienId(state)
    
    return {
        getAvailableHeaders,
        getHeaderListForMien,
        updateMienHeaders,
        onNodeSelected,
        onNodesReordered,
        header_list_name,
        items,
        selected_item_ids,
        header_list,
        mien_id,
        renderCell
    }
}

export default connect(mapStateToProps)(CommonTree)

