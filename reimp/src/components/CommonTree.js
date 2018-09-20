import React, {Component} from 'react'
import {connect} from 'react-redux'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { getCurrentMienId } from '../actions/Mien'
import SortableTree from 'react-sortable-tree'
import 'react-sortable-tree/style.css'

class CommonTree extends Component {

    onNodeClicked = (args) => {
        window.alert("clicked")
        // onNodeSelected(event, rowData.id)
    }

    onNodeMoved = (args) => {
        window.alert("moved")
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
                <div style={{height:300}}>
                  <SortableTree treeData={items}
                                onChange={this.onNodeClicked}
                                onMoveNode={this.onNodeMoved}
                  >
                    {renderNode}
                  </SortableTree>
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

