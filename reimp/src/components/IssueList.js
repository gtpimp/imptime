import React, {Component} from 'react'
import { uniq, concat, each, indexOf, map, union, difference, includes } from 'lodash'
import {connect} from 'react-redux'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import { logged_in_user } from '../actions/Auth'
import {
    makeSelTagCategoryNamesForIssues,
    makeSelTagIdsForIssues,
    makeSelIssueIds,
    makeSelIssuesById,
    makeSelInvalidatedIssueIds,
    makeSelLoadingIssueIds,
    makeSelSelectedIssues,
    makeSelFeatureIssueIds,
    makeSelFeatureIssuesById,
    makeSelSavingIssueIds,
    makeSelIssues,
    makeSelIssueObjectsToRender
} from '../selectors/IssueListSelectors'
import {
    initList,
    invalidateList,
    collapse_list,
    expand_list,
    setItemFlag,
    setCursorItem,
    getCursorItemId,
    getVisibleItemIds,
    getSelectedItemIds,
    getHighlightedItemIds,
    getItemFlag,
    getLastUpdated,
    isLoading,
    getListFilter,
    getDisplayMode
} from '../actions/ItemList'
import {
    invalidateAllIssues,
    fetchIssuesIfNeeded,
    reorderIssue,
    cancelCandidateIssue,
    updateIssueToggleAsFeature,
    groupUnsortedIssuesIntoFeature,
    ungroupIssuesIntoFeature,
    getCandidateIssue,
    ensureIssuesLoaded
} from '../actions/Issues'
import { isMienConfigurerActive } from '../actions/Mien'
import { ensureTagsLoaded } from '../actions/Tags'
import Issue from '../components/Issue'
import IssueListHeader from '../components/IssueListHeader'
import DivTable from './DivTable'
import { Shortcuts } from 'react-shortcuts'

class IssueList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onCollapse = this.onCollapse.bind(this)
        this.onExpand = this.onExpand.bind(this)
        this.onClickedIssue = this.onClickedIssue.bind(this)
        this.reorderIssue = this.reorderIssue.bind(this)
        this.toggleAsFeature = this.toggleAsFeature.bind(this)
        this.toggleExpandFeatures = this.toggleExpandFeatures.bind(this)
        this.groupTogether = this.groupTogether.bind(this)
        this.ungroupTogether = this.ungroupTogether.bind(this)
        this.handleShortcuts = this.handleShortcuts.bind(this)
        this.onDeleteIssue = this.onDeleteIssue.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, sprint_id, feature_issue_ids, tag_ids} = this.props
        if (sprint_id) {
            dispatch(initList(list_key))
            dispatch(fetchIssuesIfNeeded(list_key))
            dispatch(ensureIssuesLoaded(feature_issue_ids))
            dispatch(ensureSprintsLoaded([sprint_id]))
            dispatch(ensureTagsLoaded(tag_ids))
            this.expandUnAutoExpandedFeatures()
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key} = this.props
        const { feature_issue_ids, tag_ids, sprint_id } = new_props
        const {onSelectIssues} = this.props
        if ( this.props.sprint_id !== new_props.sprint_id ) {
            onSelectIssues([])
        }
        this.expandUnAutoExpandedFeatures(new_props)
        dispatch(fetchIssuesIfNeeded(list_key))
        dispatch(ensureIssuesLoaded(feature_issue_ids))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureTagsLoaded(tag_ids))
    }

    expandUnAutoExpandedFeatures(these_props) {
        const { dispatch, list_key, feature_issue_ids, autoexpanded_feature_ids } = these_props || this.props
        const feature_ids_to_auto_expanded = difference(feature_issue_ids, autoexpanded_feature_ids)
        if ( feature_ids_to_auto_expanded.length > 0 ) {
            dispatch(setItemFlag(list_key, feature_ids_to_auto_expanded, 'expanded_issues', true))
            dispatch(setItemFlag(list_key, feature_ids_to_auto_expanded, 'autoexpanded_feature_ids', true))
        }
    }

    handleShortcuts(action, event) {
        const { dispatch } = this.props
        switch(action) {
            case 'NEW':
                //alert("create new issue")
                break
            case 'CANCEL':
                dispatch(cancelCandidateIssue())
                break
            case 'UP':
                //this.moveCursorUp()
                break
            case 'DOWN':
                //this.moveCursorDown()
                break
            default:
                break
        }
    }

    moveCursorDown() {
        const { dispatch, list_key, issue_ids, cursor_item_id } = this.props
        if ( !cursor_item_id || !issue_ids ) {
            this.moveCursorDefault()
        } else {
            let cursor_item_id;
            let cursor_item_index = issue_ids.indexOf(cursor_item_id)
            let next_item_index = cursor_item_index + 1
            if ( next_item_index < issue_ids.length ) {
                cursor_item_id = issue_ids[next_item_index]
            }
            if ( cursor_item_id ) {
                dispatch(setCursorItem(list_key, cursor_item_id))
            }
        }
    }

    moveCursorUp() {
        const { dispatch, list_key, issue_ids, cursor_item_id } = this.props
        if ( !cursor_item_id || !issue_ids ) {
            this.moveCursorDefault()
        } else {
            let cursor_item_id;
            let prev_issue_id = issue_ids.indexOf(cursor_item_id)-1
            if ( prev_issue_id >= 0 ) {
                cursor_item_id = issue_ids[prev_issue_id]
            }
            if ( cursor_item_id ) {
                dispatch(setCursorItem(list_key, cursor_item_id))
            }
        }
    }

    moveCursorDefault() {
        const { dispatch, list_key, issue_ids, selected_ids } = this.props
        let cursor_item_id = null
        if ( selected_ids && selected_ids.length > 0 ) {
            cursor_item_id = selected_ids[selected_ids.length-1]
        } else if ( issue_ids && issue_ids.length > 0 ) {
            cursor_item_id = issue_ids[issue_ids.length-1]
        }
        if ( cursor_item_id ) {
            dispatch(setCursorItem(list_key, cursor_item_id))
        }
    }

    onDeleteIssue(issue_id) {
        const {visible_item_ids} = this.props
        const {onSelectIssues} = this.props
        const issue_index = indexOf(visible_item_ids, issue_id)
        let next_index = issue_index - 1
        if ( next_index < 0 ) {
            next_index = visible_item_ids.length-1
        }
        onSelectIssues([visible_item_ids[next_index]])
    }

    onCollapse() {
        const {dispatch, list_key} = this.props
        dispatch(collapse_list(list_key))
    }

    onExpand() {
        const {dispatch, list_key} = this.props
        dispatch(expand_list(list_key))
    }

    onClickedIssue(event, issue_id) {
        const {dispatch, onSelectIssues, selected_ids} = this.props
        event.stopPropagation()

        let selected_issue_ids = []
        if (event.ctrlKey || event.metaKey) {
            if (includes(selected_ids, issue_id)) {
                selected_issue_ids = difference(selected_ids, [issue_id])
            } else {
                selected_issue_ids = union(selected_ids, [issue_id])
            }
        } else if (event.shiftKey) {
            selected_issue_ids = concat(selected_ids, this.findIssuesFromHereToAlreadySelected(issue_id))
        } else {
            selected_issue_ids = this.findHiddenIssuesRelatingToTargetIssueId(issue_id)
        }
        onSelectIssues(selected_issue_ids)
        dispatch(cancelCandidateIssue())
    }

    findHiddenIssuesRelatingToTargetIssueId(target_issue_id) {
        const {visible_item_ids, issues, expanded_issues, issues_by_id } = this.props
        let issue_ids_to_select = [target_issue_id]
        let running_issue_index = indexOf(visible_item_ids, target_issue_id)
        let issue = issues_by_id[target_issue_id] || {}
        if (issue.can_group_issues !== true) {
            return issue_ids_to_select
        }
        if ( includes(expanded_issues, issue.id) ) {
            return issue_ids_to_select
        }

        let parent_group_id = issue.id
        running_issue_index += 1
        while( running_issue_index < visible_item_ids.length ) {
            issue = issues[running_issue_index]
            if ( issue.parent_group_id === parent_group_id ) {
                issue_ids_to_select.push(issue.id)
            } else {
                break
            }
            running_issue_index += 1
        }
        return issue_ids_to_select
    }

    findIssuesFromHereToAlreadySelected(target_issue_id) {
        const {selected_ids, visible_item_ids} = this.props

        let issue_ids_to_select = []
        let possible_issue_ids_to_select = []
        let running_issue_index = indexOf(visible_item_ids, target_issue_id)
        while(running_issue_index>0 && !includes(selected_ids, visible_item_ids[running_issue_index])) {
            possible_issue_ids_to_select.push(visible_item_ids[running_issue_index])
            running_issue_index -= 1
            if ( includes(selected_ids, visible_item_ids[running_issue_index]) ) {
                possible_issue_ids_to_select.push(visible_item_ids[running_issue_index])
                issue_ids_to_select = possible_issue_ids_to_select
            }
        }

        if ( issue_ids_to_select.length === 0 ) {
            possible_issue_ids_to_select = []
            running_issue_index = indexOf(visible_item_ids, target_issue_id)
            while(running_issue_index<visible_item_ids.length && !includes(selected_ids, visible_item_ids[running_issue_index])) {
                possible_issue_ids_to_select.push(visible_item_ids[running_issue_index])
                running_issue_index += 1
                if ( includes(selected_ids, visible_item_ids[running_issue_index]) ) {
                    possible_issue_ids_to_select.push(visible_item_ids[running_issue_index])
                    issue_ids_to_select = possible_issue_ids_to_select
                }
            }
        }

        let issue_and_feature_ids_to_select = []
        map(issue_ids_to_select, (issue_id) =>
            issue_and_feature_ids_to_select = concat(issue_and_feature_ids_to_select, this.findHiddenIssuesRelatingToTargetIssueId(issue_id)))
        return issue_and_feature_ids_to_select
    }

    onChangePage() {
        const {dispatch, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(fetchIssuesIfNeeded(list_key))
    }

    onRefresh(event) {
        const {dispatch, issue_ids, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(invalidateAllIssues(issue_ids))
        dispatch(cancelCandidateIssue())
        dispatch(fetchIssuesIfNeeded(list_key))
        if (event) {
            event.stopPropagation()
        }
    }

    toggleAsFeature(event) {
        event.stopPropagation()
        const {dispatch, selected_ids, selected_items} = this.props
        const current_value = selected_items[0].can_group_issues === true || false
        const new_value = !current_value
        dispatch(updateIssueToggleAsFeature(selected_ids, new_value))
    }

    toggleExpandFeatures(event) {
        const {dispatch, list_key, selected_ids, selected_items, expanded_issues} = this.props
        event.stopPropagation()
        const currently_expanded = includes(expanded_issues, selected_items[0].id)
        const new_value = !currently_expanded
        dispatch(setItemFlag(list_key, selected_ids, 'expanded_issues', new_value))
    }

    groupTogether(event) {
        const {selected_ids, dispatch} = this.props
        event.stopPropagation()
        dispatch(groupUnsortedIssuesIntoFeature(selected_ids))
    }

    ungroupTogether(event) {
        const {selected_ids, dispatch} = this.props
        event.stopPropagation()
        dispatch(ungroupIssuesIntoFeature(selected_ids))
    }

    reorderIssue(index_of_row_being_moved, index_of_destination) {
        const {dispatch, list_key, issue_items} = this.props

        // get issue being moved
        const moving_issue_id = issue_items[index_of_row_being_moved].id
        if ( ! moving_issue_id ) {
            return
        }
        let selected_ids = this.props.selected_ids || []
        if ( ! includes(selected_ids, moving_issue_id) ) {
            selected_ids = [moving_issue_id]
        }
        selected_ids = uniq(concat(selected_ids, this.findHiddenIssuesRelatingToTargetIssueId(moving_issue_id)))

        // get place to move it
        let move_after_issue_id
        if ( index_of_row_being_moved > index_of_destination ) {
            move_after_issue_id = (index_of_destination>0 && issue_items[index_of_destination-1].id) || null
        } else {
            move_after_issue_id = issue_items[index_of_destination].id || null
        }

        const target_hidden_child_issue_ids = (move_after_issue_id && this.findHiddenIssuesRelatingToTargetIssueId(move_after_issue_id)) || [null]
        const target_issue_id = target_hidden_child_issue_ids[target_hidden_child_issue_ids.length-1]


        dispatch(reorderIssue(selected_ids, target_issue_id, list_key,
                              index_of_destination,
                              function () {
                                  dispatch(invalidateList(list_key))
                                  dispatch(fetchIssuesIfNeeded(list_key))
                              }))
    }

    renderHeader() {
        const { header_list, tag_category_names, sprint, logged_in_user_id } = this.props
        
        return <IssueListHeader
                   header_list={header_list}
                   tag_category_names={tag_category_names}
                   sprint={sprint}
                   logged_in_user_id={logged_in_user_id}
               />
    }

    render_collapsed() {

        const {
            selected_items,
            selected_ids, highlighted_ids, loading_item_ids, list_key,
            expanded_issues, cursor_item_id, tag_category_names
        } = this.props

        return (
            <div className="panel panel--collapsed">
              <div className="panel-heading" onClick={this.onExpand}>
                <div className="panel__title">{ selected_items.map((issue, index) =>
                    <Issue
                        key={list_key + issue.id}
                        list_key={list_key}
                        is_collapsed={true}
                        show_children={includes(expanded_issues, issue.id)}
                        reorderIssue={this.reorderIssue}
                        onClickedIssue={this.onClickedIssue}
                        is_loading={loading_item_ids.indexOf(issue.id) !== -1}
                        is_selected={selected_ids.indexOf(issue.id) !== -1}
                        is_highlighted={highlighted_ids && highlighted_ids.indexOf(issue.id) !== -1}
                        is_cursor_item={""+issue.id===""+cursor_item_id}
                        issue_id={issue.id}
                        tag_category_names={tag_category_names}
                        onDelete={this.onDeleteIssue} />
                )}
                </div>
              </div>
            </div>
        )
    }

    render_candidate_issue() {

        const {list_key} = this.props

        return (
            <div key={list_key + ".candidate_issue"}
                 className="div-table__row issue_list__candidate_issue">
              <div className="div-table__cell" colSpan="20">
                Creating new issue here
              </div>
            </div>
        )
    }

    renderIssue(issue, index) {
        const {
            list_key,
            saving_issue_ids,
            invalidated_issue_ids,
            selected_ids, highlighted_ids, loading_item_ids, expanded_issues,
            header_list, cursor_item_id, tag_category_names
        } = this.props
        const key = issue.id + "_" + index
        const issue_id = issue.id
        const that = this

        return <Issue
                   key={key}
                   list_key={list_key}
                   is_collapsed={false}
                   show_children={includes(expanded_issues, issue.id)}
                   onClickedIssue={that.onClickedIssue}
                   is_loading={loading_item_ids.indexOf(issue_id) !== -1}
                   is_selected={selected_ids.indexOf(issue_id) !== -1}
                   is_highlighted={highlighted_ids && highlighted_ids.indexOf(issue_id) !== -1}
                   is_cursor_item={""+issue.id===""+cursor_item_id}
                   is_invalidated={invalidated_issue_ids.indexOf(issue_id) !== -1}
                   is_saving={saving_issue_ids.indexOf(issue_id) !== -1}
                   issue_id={issue_id}
                   header_list={header_list}
                   onDelete={that.onDeleteIssue}
                   tag_category_names={tag_category_names}
                   is_fake={false}
        />
    }

    renderMienConfigurer() {
        return (
            <div>
              Configuring
            </div>
        )
    }

    render_expanded() {

        const { is_mien_configurer_active, is_visible, issue_items, project_id } = this.props

        if (!is_visible) {
            return (<div></div>)
        }
        const that = this

        if ( is_mien_configurer_active ) {
            return this.renderMienConfigurer()
        }

        if ( issue_items.length === 0 ) {
            return (
                <div className="div-table__row">
                  <div className="div-table__cell">No issues</div>
                </div>
            )
        }

        const issue_rows = []
        each( issue_items, function(issue_item, index) {
            if ( ! issue_item ) {
                console.error("Unexpected: issue_item should not be null")
            } else if ( issue_item.type === "candidate" ) {
                issue_rows.push(that.render_candidate_issue())
            } else if ( issue_item.type === "feature" ) {
                issue_rows.push(that.renderIssue(issue_item.issue, index))
            } else if ( issue_item.type === "issue" ) {
                issue_rows.push(that.renderIssue(issue_item.issue, index))
            }
        })

        return (

            <div>
              <DivTable renderHeader={this.renderHeader}
                        onReorder={this.reorderIssue}
                        project_id={project_id}
                        permission_name_for_dragging={'has_edit_issues'}>
                {issue_rows}
              </DivTable>
            </div>
        )
    }

    render() {

        const {is_visible, is_collapsed, is_expanded} = this.props

        if (!is_visible) {
            return (<div></div>)
        }

        return (
            <Shortcuts name='ISSUE_LIST' handler={this.handleShortcuts}>
              <div>
                { is_collapsed && this.render_collapsed() }
                { is_expanded && this.render_expanded() }
              </div>
            </Shortcuts>
        )
    }
}

const makeMapStateToProps = () => {
    const selTagCategoryNamesForIssues = makeSelTagCategoryNamesForIssues()
    const selTagIdsForIssues = makeSelTagIdsForIssues()
    const selIssueIds = makeSelIssueIds()
    const selIssuesById = makeSelIssuesById()
    const selInvalidatedIssueIds = makeSelInvalidatedIssueIds()
    const selLoadingIssueIds = makeSelLoadingIssueIds()
    const selSelectedIssues = makeSelSelectedIssues()
    const selFeatureIssueIds = makeSelFeatureIssueIds()
    const selFeatureIssuesById = makeSelFeatureIssuesById()
    const selSavingIssueIds = makeSelSavingIssueIds()
    const selIssues = makeSelIssues()
    const selIssueObjectsToRender = makeSelIssueObjectsToRender()
    const mapStateToProps = (state, props) => {
        const {list_key, issue_header_list} = props
        const filter = getListFilter(state, list_key)
        const sprint_id = filter.sprint_id || null
        const sprint = getSprint(state, sprint_id) || {}
        const visible_item_ids = getVisibleItemIds(state, list_key)
        const items_by_id = selIssuesById(state, props)
        const feature_issue_ids = selFeatureIssueIds(state, props)
        const loading_item_ids = selLoadingIssueIds(state, props)
        const invalidated_item_ids = selInvalidatedIssueIds(state, props)
        const saving_item_ids = selSavingIssueIds(state, props)
        const selected_item_ids = getSelectedItemIds(state, list_key)
        const highlighted_item_ids = getHighlightedItemIds(state, list_key)
        const tag_ids = selTagIdsForIssues(state, list_key)
        const selected_items = selSelectedIssues(state, props)
        const items = selIssues(state, props)
        const feature_issues = selFeatureIssuesById(state, props)
        const candidate_issue = getCandidateIssue(state)
        const is_creating_issue = candidate_issue || false
        const cursor_item_id = getCursorItemId(state, list_key)
        const display_mode = getDisplayMode(state, list_key)
        const expanded_issues = getItemFlag(state, list_key, "flag_expanded_issues")
        const autoexpanded_feature_ids = getItemFlag(state, list_key, "flag_autoexpanded_feature_ids")
        const issue_items = selIssueObjectsToRender(state, props)
        const tag_category_names = selTagCategoryNamesForIssues(state, props)
        const logged_in_user_id = logged_in_user().user_id
        const issue_ids = selIssueIds(state, props)
        const is_mien_configurer_active = isMienConfigurerActive(state)

        return {
            list_key: list_key,
            visible_item_ids,
            sprint_id: sprint_id,
            sprint,
            project_id: sprint.project_id,
            issues: items,
            issue_items,
            issues_by_id: items_by_id,
            issue_ids,
            feature_issue_ids: feature_issue_ids,
            feature_issues: feature_issues,
            selected_ids: selected_item_ids,
            selected_items: selected_items,
            highlighted_ids: highlighted_item_ids,
            cursor_item_id,
            invalidated_issue_ids: invalidated_item_ids,
            saving_issue_ids: saving_item_ids,
            loading_item_ids: loading_item_ids,
            has_items: items && items.length > 0,
            is_loading: isLoading(state, list_key),
            is_collapsed: display_mode === "collapsed",
            is_expanded: display_mode === "expanded" || !display_mode,
            last_updated: getLastUpdated(state, list_key),
            is_visible: sprint_id || (visible_item_ids && visible_item_ids.length > 0) || false,
            candidate_issue: candidate_issue,
            is_creating_issue: is_creating_issue,
            expanded_issues: expanded_issues,
            autoexpanded_feature_ids,
            header_list: issue_header_list,
            tag_ids,
            tag_category_names,
            logged_in_user_id,
            is_mien_configurer_active
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(IssueList)
