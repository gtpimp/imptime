import React, {Component} from 'react'
import {connect} from 'react-redux'
import { indexOf, map, initial } from 'lodash'
import { css } from 'emotion'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import { getCurrentMienId } from '../actions/Mien'
import { SortableTreeWithoutDndContext as SortableTree } from 'react-sortable-tree'
// import 'react-sortable-tree/style.css'
import CommonTreeTheme from './CommonTreeTheme'

class CommonTree extends Component {

    constructor(props) {
        super(props)
        this.state = { searchString: '',
                       searchFocusIndex: 0,
                       searchFoundCount: null,
                       initial_expansion_done: false }
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { items_by_id, onExpandCollapse } = props
        const { initial_expansion_done } = this.state
        let node
        if ( props.selected_item_ids !== this.props.selected_item_ids || !initial_expansion_done ) {
            map(props.selected_item_ids, function(item_id) {
                const node = items_by_id[item_id]
                if ( node ) {
                    const parent_node = items_by_id[node.parent_id]
                    if ( parent_node && !parent_node.expanded ) {
                        onExpandCollapse({parent_node, expanded:true})
                    }
                }
            })
        }
        if ( node && node.loaded !== false ){
            this.setState({initial_expansion_done:true})
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

    onNodeClicked = (evt, rowInfo) => {
        const { onNodeSelected } = this.props
        evt.stopPropagation()
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
            new_parent_node = { children:items }
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
        const { renderIcons, all_headers, header_list_name, items } = this.props
        const { searchString, searchFocusIndex } = this.state

        return (

            <MienListColumnConfigurable all_headers={all_headers}
                                        header_list_name={header_list_name}
            >
              {({active_headers}) => (
                   <div className={css`height:100%`}>
                     { this.renderSearchForm() }
                     <SortableTree theme={CommonTreeTheme}
                                   treeData={items}
                                   rowHeight={50}
                                   onChange={this.onNodeChanged}
                                   onVisibilityToggle={this.onNodeVisiblityToggle}
                                   getNodeKey={({node}) => node.id || "root"}
                                   onMoveNode={this.onNodeMoved}
                                   searchQuery={searchString}
                                   searchFocusOffset={searchFocusIndex}
                                   searchFinishCallback={this.onSearched}

                                   generateNodeProps={rowInfo => ({
                                           buttons: renderIcons(rowInfo),
                                           onClick: (evt) => this.onNodeClicked(evt, rowInfo),
                                       })}
                     />
                   </div>
               )}
              
            </MienListColumnConfigurable>
        )        
        
    }
}

function mapStateToProps(state, props) {
    
    const { all_headers, header_list_name,
            onExpandCollapse, items_by_id, renderIcons,
            selected_item_ids, onNodeSelected, onReorder, items } = props

    const mien_id = getCurrentMienId(state)
    
    return {
        onNodeSelected,
        onReorder,
        onExpandCollapse,
        header_list_name,
        items,
        items_by_id,
        selected_item_ids,
        all_headers,
        header_list_name,
        mien_id,
        renderIcons
    }
}

export default connect(mapStateToProps)(CommonTree)

