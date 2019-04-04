import React, {Component} from 'react'
import {connect} from 'react-redux'
import { each, map, union, includes, difference, keys } from 'lodash'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import {
    ENTITY_KEY__SPRINT,
    SPRINT_TYPE_ORDER,
    HEADER_LIST_NAME__SPRINT,
    getCellStyle
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    getListFilter,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getSelectedItemIds,
    getSelectedItems
} from '../actions/ItemList'
import {
    invalidateAllSprints,
    fetchSprintsIfNeeded,
    reorderSprints,
    startCandidateSprint,
    cancelCandidateSprint,
    ALL_AVAILABLE_SPRINT_HEADERS
} from '../actions/Sprints'
import {
    setGloballySelectedSprintId,
} from '../actions/Page'
import Sprint from './Sprint'
import MienListColumnConfigurable from './MienListColumnConfigurable'
import DivTable from './DivTable'
import DivTableHeaderRow from './DivTableHeaderRow'
import DivTableHeaderCell from './DivTableHeaderCell'

class SprintList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onClickedSprint = this.onClickedSprint.bind(this)
        this.reorderSprints = this.reorderSprints.bind(this)
        this.onStartCandidateSprint = this.onStartCandidateSprint.bind(this)
        this.onCancelCandidateSprint = this.onCancelCandidateSprint.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(fetchSprintsIfNeeded(list_key))
        }

    }

    elemInViewport(elem) {
        var bounding = elem.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    componentDidUpdate() {
        const {last_selected_sprint_id} = this.props

        if (last_selected_sprint_id) {
            var selected_sprint_id = "sprint_" + last_selected_sprint_id
            var selected_sprint_row = document.getElementById(selected_sprint_id)

            if (selected_sprint_row && !this.elemInViewport(selected_sprint_row)) {
                selected_sprint_row.scrollIntoView()
            }            
        }
    }
    
    componentWillReceiveProps(new_props) {
        const {dispatch, list_key} = this.props
        const { project_id } = new_props
        if (project_id) {
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    onClickedSprint(event, sprint_id) {
        const {dispatch, onSelectSprints, selected_ids, project_id} = this.props
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
        dispatch(setGloballySelectedSprintId(project_id, sprint_id))
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
        const {dispatch, project_id} = this.props
        event.stopPropagation()
        dispatch(startCandidateSprint(project_id))
    }

    onCancelCandidateSprint() {
        const {dispatch} = this.props
        dispatch(cancelCandidateSprint())
    }

    reorderSprints(sprint_type, index_of_row_being_moved, original_index_of_destination) {
        const {dispatch, list_key, sprints_by_type} = this.props
        const sprints = sprints_by_type[sprint_type]
        dispatch(reorderSprints(sprints, index_of_row_being_moved, original_index_of_destination, list_key))
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

    render_sprint(sprint, header_list, list_key, index, that, loading_item_ids,
                  selected_ids) {

        return (
            <Sprint key={list_key + sprint.id + index}
                    header_list={header_list}
                    onClickedSprint={(event) => that.onClickedSprint(event, sprint.id)}
                    is_loading={loading_item_ids.indexOf(sprint.id) !== -1}
                    is_selected={selected_ids.indexOf(sprint.id) !== -1}
                    sprint_id={sprint.id}
            />
        )
    }

    renderHeader(header_list, sprint_type) {
        return (
            <DivTableHeaderRow>
              { map(header_list, (v, index) => (
                  <DivTableHeaderCell key={index}
                                      extra_style={getCellStyle(v)}>
                    { v.key === "name" &&
                      <div className={css`font: ${theme.fonts.bold_large}; `}>
                        {sprint_type}
                      </div>
                    }
                    { v.key !== "name" && v.label }
                  </DivTableHeaderCell>
              ))}
            </DivTableHeaderRow>
        )
    }

    create_sprint_rows(sprints, header_list) {
        const { list_key, selected_ids, loading_item_ids } = this.props

        const that = this
        const sprint_rows = []
        map(sprints, function(sprint, index) {
            sprint_rows.push(
                that.render_sprint(sprint, header_list, list_key, index, that, loading_item_ids, selected_ids)
            )
            
        })
        return sprint_rows
    }

    render() {

        const { sprints_by_type, project_id } = this.props
        const that = this

        const sprint_types = union(SPRINT_TYPE_ORDER, keys(sprints_by_type))
        
        return (
            <div className="sprint_list__container">
              <MienListColumnConfigurable all_headers={ALL_AVAILABLE_SPRINT_HEADERS}
                                          header_list_name={HEADER_LIST_NAME__SPRINT}
              >
                {({active_headers}) => (
                    <div>
                      { map(sprint_types, function(sprint_type) {
                            const sprints = sprints_by_type[sprint_type]
                            if ( !sprints || sprints.length === 0 ) {
                                return null
                            }
                            const sprint_rows = that.create_sprint_rows(sprints, active_headers)
                            return (
                                <div key={sprint_type}>
                                  <DivTable onReorder={(a,b) => that.reorderSprints(sprint_type, a,b)}
                                            renderHeader={() => that.renderHeader(active_headers, sprint_type || "")}
                                            project_id={project_id}
                                            permission_name_for_dragging={'has_edit_sprint'} >
                                    {sprint_rows}
                                  </DivTable>
                                </div>
                            )

                        })}
                    </div>
                )}
              </MienListColumnConfigurable>
            </div>
        )
    }
}

function collect_sprints_by_type(sprints) {
    const sprints_by_type = {}
    each(sprints, function (sprint, index) {

        const sprint_type = sprint.sprint_type
        if ( sprints_by_type[sprint_type] === undefined ) {
            sprints_by_type[sprint_type] = []
        }
        sprints_by_type[sprint_type].push(sprint)
    })

    return sprints_by_type
}

function mapStateToProps(state, props) {
    const {list_key} = props

    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__SPRINT)
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const selected_items = getSelectedItems(state, list_key, ENTITY_KEY__SPRINT)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const filter = getListFilter(state, list_key)
    const project_id = filter.project_id || null
    const sprints_by_type = collect_sprints_by_type(visible_items)
    
    return {
        list_key: list_key,
        project_id: project_id,
        sprints: visible_items,
        sprints_by_type,
        visible_item_ids,
        sprint_ids: visible_item_ids,
        selected_ids: selected_item_ids,
        selected_items: selected_items || [],
        loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_visible: project_id || false,
        is_loading,
        last_updated,
    }
}

export default connect(mapStateToProps)(SprintList)
