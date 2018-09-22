import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { getCurrentMienId } from '../actions/Mien'
import SortableTree from 'react-sortable-tree'
import { getVisibleNodeInfoAtIndex } from 'react-sortable-tree'
import 'react-sortable-tree/style.css'

class CommonTree extends Component {

    onNodeClicked = (args) => {
        // window.alert("clicked")
        // onNodeSelected(event, rowData.id)
    }

    onNodeVisiblityToggle = (args) => {
        const { onExpandCollapse } = this.props
        const { node, expanded } = args
        onExpandCollapse({node, expanded})
    }

    onNodeMoved = (args) => {
        const { onReorder } = this.props
        const { node, nextParentNode, treeIndex } = args

        let tree_index_previous_sibling = treeIndex - 1
        if ( tree_index_previous_sibling < 0 ) {
            tree_index_previous_sibling = null
        }
        let node_before = this.getNodeAtIndex(tree_index_previous_sibling)
        if ( node_before.parent != node.parent ) {
            node_before = null
        }
        
        if ( node.parent_id !== (nextParentNode && nextParentNode.id) || null ) {
            onReorder({node:node, new_parent:nextParentNode})
        }
    }

    getNodeAtIndex(treeIndex) {
        const { items } = this.props
        return getVisibleNodeInfoAtIndex({treeData: items,
                                          index: treeIndex,
                                          getNodeKey: (node) => node.id})
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
                <div className={css`height:100%`}>
                  <SortableTree treeData={items}
                                onChange={this.onNodeClicked}
                                onVisibilityToggle={this.onNodeVisiblityToggle}
                                getNodeKey={({node}) => node.id || "root"}
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
            onExpandCollapse,
            selected_item_ids, onNodeSelected, onReorder, items, header_list, renderCell } = props

    const mien_id = getCurrentMienId(state)
    
    return {
        getAvailableHeaders,
        getHeaderListForMien,
        updateMienHeaders,
        onNodeSelected,
        onReorder,
        onExpandCollapse,
        header_list_name,
        items,
        selected_item_ids,
        header_list,
        mien_id,
        renderCell
    }
}

export default connect(mapStateToProps)(CommonTree)

