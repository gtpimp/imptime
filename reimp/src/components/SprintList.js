import React, {Component} from 'react'
import {connect} from 'react-redux'

import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'
import each from 'lodash/each'
import map from 'lodash/map'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import {
    PAGE_KEY__SPRINTS_TOOLBAR
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    invalidateList,
    collapse_list,
    expand_list,
    update_list_filter
} from '../actions/ItemList'
import {
    invalidateAllSprints,
    fetchSprintsIfNeeded,
    reorderSprints,
    startCandidateSprint,
    updateCandidateTitle,
    cancelCandidateSprint,
    saveCandidateSprint
} from '../actions/Sprints'
import Sprint from './Sprint'
import DivTable from './DivTable'

class SprintList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onCollapse = this.onCollapse.bind(this)
        this.onExpand = this.onExpand.bind(this)
        this.onClickedSprint = this.onClickedSprint.bind(this)
        this.reorderSprints = this.reorderSprints.bind(this)
        this.onStartCandidateSprint = this.onStartCandidateSprint.bind(this)
        this.onSaveCandidateSprint = this.onSaveCandidateSprint.bind(this)
        this.onCancelCandidateSprint = this.onCancelCandidateSprint.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key} = this.props
        const { project_id } = new_props
        if (project_id) {
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    onCollapse() {
        const {dispatch, list_key} = this.props
        dispatch(collapse_list(list_key))
    }

    onExpand() {
        const {dispatch, list_key} = this.props
        dispatch(expand_list(list_key))
    }

    onClickedSprint(event, sprint_id) {
        const {onSelectSprints, selected_ids} = this.props
        event.stopPropagation()

        let selected_sprint_ids = []
        if (event.ctrlKey) {
            if (includes(selected_ids, sprint_id)) {
                selected_sprint_ids = difference(selected_ids, [sprint_id])
            } else {
                selected_sprint_ids = union(selected_ids, [sprint_id])
            }
        } else {
            selected_sprint_ids = [sprint_id]
        }
        onSelectSprints(selected_sprint_ids)
    }

    onChangePage() {
        const {dispatch, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(fetchSprintsIfNeeded(list_key))
    }

    onRefresh(event) {
        const {dispatch, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(invalidateAllSprints())
        dispatch(fetchSprintsIfNeeded(list_key))
        if (event) {
            event.stopPropagation()
        }
    }

    onStartCandidateSprint(event) {
        const {dispatch, list_key} = this.props
        event.stopPropagation()
        dispatch(startCandidateSprint(list_key))
    }

    onSaveCandidateSprint(candidate_sprint_title) {
        const {dispatch} = this.props
        dispatch(updateCandidateTitle(candidate_sprint_title))
        dispatch(saveCandidateSprint())
    }

    onCancelCandidateSprint() {
        const {dispatch} = this.props
        dispatch(cancelCandidateSprint())
    }

    reorderSprints(index_of_row_being_moved, original_index_of_destination) {
        const {dispatch, list_key, visible_item_ids} = this.props

        let index_of_destination = original_index_of_destination

        if ( index_of_row_being_moved > index_of_destination ) {
            index_of_destination -= 1;
        }

        const moving_sprint_id = visible_item_ids[index_of_row_being_moved]
        const move_after_sprint_id = (index_of_destination>=0 && visible_item_ids[index_of_destination]) || null
        
        dispatch(reorderSprints(moving_sprint_id, move_after_sprint_id, list_key,
                                original_index_of_destination))
    }

    render_candidate_sprint() {
        const {list_key} = this.props

        return (
            <div key={list_key + ".candidate_sprint"}
                 className="div-list__row sprint_list__candidate_sprint">
              <div className="div-list__cell">
                Creating new sprint here
              </div>
            </div>
        )
    }

    render_sprint(sprint, list_key, index, that, loading_item_ids,
                  selected_ids) {
        const { header_list } = this.props

        return (
            <Sprint key={list_key + sprint.id + index}
                    is_collapsed={false}
                    header_list={header_list}
                    onClickedSprint={(event) => that.onClickedSprint(event, sprint.id)}
                    is_loading={loading_item_ids.indexOf(sprint.id) !== -1}
                    is_selected={selected_ids.indexOf(sprint.id) !== -1}
                    sprint_id={sprint.id}
            />
        )
    }

    render_sprint_type_header(sprint_type) {

        const readable_sprint_type = (sprint_type || "unknown").replace(/_/g, " ")
        
        return (
            <div key={"sprint_type_header_" + sprint_type}
                 className="sprint__sprint_type_header">
              {readable_sprint_type}
            </div>
        )
    }

    create_sprint_rows(sprints) {
        const { list_key, selected_ids, is_creating_sprint,
                candidate_sprint, loading_item_ids, sprints_by_type } = this.props

        const that = this
        const sprint_rows = []
        map(sprints, function(sprint, index) {
            /* if (is_creating_sprint && index === 0 && !candidate_sprint.sprint_id_before) {
             *     sprint_rows.push(that.render_candidate_sprint())
             * }*/

            sprint_rows.push(
                that.render_sprint(sprint, list_key, index, that, loading_item_ids, selected_ids)
            )
            
            /* if (is_creating_sprint && candidate_sprint.sprint_id_before === sprint.id) {
             *     sprint_rows.push(that.render_candidate_sprint())
             * }*/
        })
        return sprint_rows
    }

    render() {

        const { sprints, list_key, selected_ids, is_creating_sprint,
                candidate_sprint, loading_item_ids, sprints_by_type } = this.props
        const that = this
        const sprint_rows = []

        return (
            <div className="sprint_list__container">
              { map(sprints_by_type, function(sprints, sprint_type) {
                    const sprint_rows = that.create_sprint_rows(sprints)
                    return (
                        <div key={sprint_type}>
                          <div className={"sprint_type_header sprint_type_header_" + sprint_type}>
                            {sprint_type || ""}
                          </div>
                          <DivTable onReorder={that.reorderSprints}>
                            {sprint_rows}
                          </DivTable>
                        </div>
                    )
                    
                })}
            </div>
        )
    }
}

function collect_sprints_by_type(sprints) {
    const sprints_by_type = {}
    let running_sprint_type = null
    each(sprints, function (sprint, index) {

        if ( running_sprint_type !== sprint.sprint_type ) {
            running_sprint_type = sprint.sprint_type
            sprints_by_type[running_sprint_type] = []
        }
        sprints_by_type[running_sprint_type].push(sprint)
        
    })
    
    return sprints_by_type
}

            function mapStateToProps(state, props) {
    const {sprint, item_list} = state
    const {list_key, header_list} = props
    const items_by_id = (sprint && sprint.items_by_id) || {}
    const l = (item_list && item_list[list_key]) || {}
    const filter = l.filter || {}
    const project_id = filter.project_id || null
    const visible_item_ids = l.visible_item_ids || []

    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {
            'id': selected_id,
            'loaded': false
        }
    })

    const items = (items_by_id && visible_item_ids.map(function (visible_item_id, index) {
        return items_by_id[visible_item_id] || {
            'id': visible_item_id,
            'loaded': false
        }
    })) || []

    const candidate_sprint = (sprint && sprint.candidate_sprint) || null
    const is_creating_sprint = candidate_sprint || false
    const sprints_by_type = collect_sprints_by_type(items)

    return {
        list_key: list_key,
        project_id: project_id,
        sprints: items,
        sprints_by_type,
        visible_item_ids,
        sprint_ids: map(items, 'id'),
        selected_ids: l.selected_ids || [],
        selected_items: selected_items || [],
        loading_item_ids: l.loading_item_ids || [],
        has_items: items && items.length > 0,
        is_visible: project_id || false,
        is_loading: l.is_loading,
        is_collapsed: l.display_mode === "collapsed",
        is_expanded: l.display_mode === "expanded" || !l.display_mode,
        last_updated: l.last_updated,
        candidate_sprint: candidate_sprint,
        is_creating_sprint: is_creating_sprint,
        header_list: header_list
    }
}

export default connect(mapStateToProps)(SprintList)
