import React, {Component} from 'react'
import {connect} from 'react-redux'
import { uniq, map, keys, groupBy } from 'lodash'
import Tag from './Tag'
import EditableIssueTag from './EditableIssueTag'
import { getTags, ensureTagsLoaded, fetchTagsIfNeeded } from '../actions/Tags'
import { has_permission } from '../actions/Users'
import {
    initList,
    invalidateList,
    update_list_filter,
    getVisibleItemIds,
    getVisibleItems,
    getListFilter
} from '../actions/ItemList'
import { getItems } from '../actions/Item'
import { getIssues,
         addTagToIssues,
         deleteTagFromIssues
} from '../actions/Issues'
import TreeView from 'react-treeview';
import { ENTITY_KEY__TAG } from '../actions/ItemListKeyRegistry.js'

class TagListTree extends Component {

    constructor(props) {
        super(props)
        this.onTagClicked = this.onTagClicked.bind(this)
    }
    
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
        if ( props.filter.project_id != project_id ) {
            dispatch(update_list_filter(list_key, {'project_id':  project_id}))
            dispatch(invalidateList(list_key))
        }
        dispatch(fetchTagsIfNeeded(list_key))
    }

    onTagClicked(ev, tag) {
        const { onSelectTag } = this.props
        if ( onSelectTag ) {
            ev.stopPropagation()
            onSelectTag(tag.id)
        }
    }

    render() {
        const {project_tags_by_category, issue_ids} = this.props
        const that = this
        
        return (
            <div className="tag_list">
              { !project_tags_by_category || !project_tags_by_category.length &&
                <div className="tag-list__empty">
                  No tags
                </div>
              }

              { map(keys(project_tags_by_category), function(category_name, index) {
                    const tags_for_category = project_tags_by_category[category_name]
                    return (
                        <TreeView key={index}
                                  nodeLabel={category_name}
                                  itemClassName="taglisttree__category-name"
                                  defaultCollapsed={false}>

                          {map(tags_for_category, function(tag) {
                               return (
                                   <div key={tag.id}
                                        className="taglisttree__tag-name"
                                        onClick={(ev) =>  that.onTagClicked(ev, tag)}>
                                     <div className="taglisttree__tag">
                                       <Tag tag_id={tag.id} />
                                     </div>
                                   </div>
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

    const { project_id, list_key, onSelectTag } = props

    const project_tag_ids = getVisibleItemIds(state, list_key) || []
    const project_tags = getItems(state, ENTITY_KEY__TAG, project_tag_ids) || []
    const project_tags_by_category = groupBy(uniq(project_tags), 'category_name')
    const filter = getListFilter(state, list_key)

    return {
        project_tags_by_category,
        list_key,
        onSelectTag,
        project_id,
        filter
    }
}

export default connect(mapStateToProps)(TagListTree)
