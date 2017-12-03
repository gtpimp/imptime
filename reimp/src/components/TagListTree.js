import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, keys, groupBy } from 'lodash'
import Tag from './Tag'
import EditableIssueTag from './EditableIssueTag'
import { getTags, ensureTagsLoaded, fetchTagsIfNeeded } from '../actions/Tags'
import { has_permission } from '../actions/Users'
import {
    initList,
    invalidateList,
    update_list_filter,
    getVisibleItemIds,
    getVisibleItems
} from '../actions/ItemList'
import { getItems } from '../actions/Item'
import { getIssues,
         addTagToIssues,
         deleteTagFromIssues
} from '../actions/Issues'
import TreeView from 'react-treeview';
import { ENTITY_KEY__TAG } from '../actions/ItemListKeyRegistry.js'

class TagListTree extends Component {

    componentDidMount() {
        const { dispatch, list_key, project_id } = this.props
        if ( project_id ) {
            dispatch(initList(list_key))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { tag_ids, dispatch, list_key, project_id } = props
        dispatch(ensureTagsLoaded(tag_ids))
        if ( this.props.project_id != props.project_id ) {
            dispatch(update_list_filter(list_key, {'project_id':  project_id}))
        }
        dispatch(fetchTagsIfNeeded(list_key))
    }

    render() {
        const {project_tags_by_category, issue_ids} = this.props
        
        return (
            <div className="tag_list">
              { project_tags_by_category.length == 0 &&
                <div className="tag-list__empty">
                  No tags
                </div>
              }

              { map(project_tags_by_category, function(tags_for_category, category_name) {
                    return (
                        <TreeView key={category_name}
                                  nodeLabel={category_name}
                                  defaultCollapsed={false}>

                          {map(tags_for_category, function(tag) {
                               return (
                                   <div className="taglisttree__tag-name">{tag.name}</div>
                               )
                           })
                          }

                          
                        </TreeView>
                        
                    )
                })
              }

            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, list_key } = props

    const project_tag_ids = getVisibleItemIds(state, list_key) || []
    const project_tags = getItems(state, ENTITY_KEY__TAG, project_tag_ids) || []
    const project_tags_by_category = groupBy(project_tags, 'category_name')
    
    return {
        project_tags_by_category,
        list_key
    }
}

export default connect(mapStateToProps)(TagListTree)
