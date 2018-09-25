import React, {Component} from 'react'
import {connect} from 'react-redux'
import { indexOf, map, initial, includes } from 'lodash'
import { css } from 'emotion'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { getCurrentMienId } from '../actions/Mien'
import SortableTree from 'react-sortable-tree'
import 'react-sortable-tree/style.css'

class CommonTree extends Component {

    constructor(props) {
        super(props)
        this.state = { searchString: '',
                       searchFocusIndex: 0,
                       searchFoundCount: null }
    }

    componentDidMount() {
        const { items_by_id, onExpandCollapse, selected_item_ids } = this.props
        map(selected_item_ids, function(item_id) {
            const node = items_by_id[item_id]
            onExpandCollapse({node, expanded:true})
        })
    }

    componentWillReceiveProps(new_props) {
        const { items_by_id, onExpandCollapse } = new_props
        if ( new_props.selected_item_ids !== this.props.selected_item_ids ) {
            map(new_props.selected_item_ids, function(item_id) {
                const node = items_by_id[item_id]
                onExpandCollapse({node, expanded:true})
            })
        }
    }

    selectPrevMatch = () => {
        const { searchFocusIndex, searchFoundCount } = this.state;
        this.setState({
            searchFocusIndex: searchFocusIndex !== null ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount : searchFoundCount - 1,
        })
    }

    selectNextMatch = () =>  {
        const { searchFocusIndex, searchFoundCount } = this.state;
        this.setState({searchFocusIndex: searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0,})
    }
    
    onNodeChanged = (nodes) => {
        const { onNodeSelected } = this.props
        onNodeSelected(nodes[0])
    }

    onNodeClicked = (rowInfo) => {
        const { onNodeSelected } = this.props
        onNodeSelected(rowInfo.node)
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
        let node_before = this.getPreviousSibling(node, nextParentNode)
        
        onReorder({node:node, new_parent:nextParentNode, sibling_node_before:node_before})
    }

    getPreviousSibling(node, new_parent_node) {
        const { items } = this.props

        if ( new_parent_node === null ) {
            new_parent_node = items
        }
        const pos_of_node = indexOf(new_parent_node.children, node)
        const previous_sibling_pos = pos_of_node - 1
        if ( previous_sibling_pos < 0 ) {
            return null
        }
        return new_parent_node.children[previous_sibling_pos]
    }

    onSearched = (matches) => {
        const { onExpandCollapse, items_by_id } = this.props
        const { searchFocusIndex } = this.state

        if ( matches.length > 0 && matches[searchFocusIndex] ) {
            const match = matches[searchFocusIndex]
            map(initial(match.path), (id) => onExpandCollapse({node:items_by_id[id], expanded:true}))
        }
        
        this.setState({searchFoundCount: matches.length,
                       searchFocusIndex: matches.length > 0 ? searchFocusIndex % matches.length : 0})
    }

    renderSearchForm() {
        const { searchString, searchFocusIndex, searchFoundCount } = this.state
        return (
            <form
                style={{ display: 'inline-block' }}
                onSubmit={event => {
                        event.preventDefault();
                }}
            >
              <label htmlFor="find-box">
                Search:&nbsp;
                <input
                    id="find-box"
                    type="text"
                    value={searchString}
                    onChange={event =>
                        this.setState({ searchString: event.target.value })
                    }
                />
              </label>

              <button
                  className="btn btn-info"
                  type="button"
                  disabled={!searchFoundCount}
                  onClick={this.selectPrevMatch}
              >
            &lt;
              </button>

              <button
                  className="btn btn-info"
                  type="submit"
                  disabled={!searchFoundCount}
                  onClick={this.selectNextMatch}
              >
            &gt;
              </button>

              <span>
            &nbsp;
            {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
            {' / '}
            {searchFoundCount || 0}
              </span>
            </form>
        )
    }
    
    render() {
        const { renderNode, getAvailableHeaders, selected_item_ids,
                getHeaderListForMien, updateMienHeaders, header_list_name, items } = this.props
        const { searchString, searchFocusIndex } = this.state

        return (

            <MienListColumnConfigurable getAvailableHeaders={getAvailableHeaders}
                                        getHeaderListForMien={getHeaderListForMien}
                                        updateMienHeaders={updateMienHeaders}
                                        header_list_name={header_list_name}
            >
              <div className={css`height:100%`}>
                { this.renderSearchForm() }
                <SortableTree treeData={items}
                              onChange={this.onNodeChanged}
                              onVisibilityToggle={this.onNodeVisiblityToggle}
                              getNodeKey={({node}) => node.id || "root"}
                              onMoveNode={this.onNodeMoved}
                              searchQuery={searchString}
                              searchFocusOffset={searchFocusIndex}
                              searchFinishCallback={this.onSearched}

                              generateNodeProps={rowInfo => ({
                                      buttons: [
                                          <button className="btn btn-outline-success"
                                                  style={{verticalAlign: 'middle'}}
                                                  onClick={() => this.onNodeClicked(rowInfo)}
                                          >
                                            <input type="checkbox"
                                                   readOnly={true}
                                                   checked={includes(selected_item_ids, rowInfo.node.id)} />
                                          </button>,
                                      ],
                                  })}
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
            onExpandCollapse, items_by_id, 
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
        items_by_id,
        selected_item_ids,
        header_list,
        mien_id,
        renderCell
    }
}

export default connect(mapStateToProps)(CommonTree)

