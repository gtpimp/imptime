import React, {Component} from 'react'
import { uniq, concat, each, indexOf, map, keys, union, difference, includes } from 'lodash'
import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'
import {connect} from 'react-redux'
import TagEditor from '../components/TagEditor'
import EstimateEditor from '../components/EstimateEditor'
import { ISSUE_HEADER_LIST_FEATURE } from '../actions/ItemListKeyRegistry.js';
import {
    initList,
    invalidateList,
    collapse_list,
    expand_list,
    setItemFlag,
    setCursorItem,
    getCursorItemId
} from '../actions/ItemList'
import {
    invalidateAllIssues,
    fetchIssuesIfNeeded,
    reorderIssue,
    startCandidateIssue,
    updateCandidateSubject,
    cancelCandidateIssue,
    saveCandidateIssue,
    updateIssueToggleAsFeature,
    groupUnsortedIssuesIntoFeature,
    ungroupIssuesIntoFeature,
} from '../actions/Issues'
import Issue from '../components/Issue'
import DivTable from './DivTable'
import { Shortcuts } from 'react-shortcuts'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

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
        this.openTagEditor = this.openTagEditor.bind(this)
        this.closeTagEditor = this.closeTagEditor.bind(this)
        this.openEstimateEditor = this.openEstimateEditor.bind(this)
        this.closeEstimateEditor = this.closeEstimateEditor.bind(this)
        this.handleShortcuts = this.handleShortcuts.bind(this)
        this.onDeleteIssue = this.onDeleteIssue.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, sprint_id} = this.props
        if (sprint_id) {
            dispatch(initList(list_key))
            dispatch(fetchIssuesIfNeeded(list_key))
            console.log(list_key)
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key} = this.props
        const {onSelectIssues} = this.props
        if ( this.props.sprint_id != new_props.sprint_id ) {
            onSelectIssues([])
        }
        dispatch(fetchIssuesIfNeeded(list_key))
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
        }
    }

    moveCursorDown() {
        const { dispatch, list_key, issue_ids, selected_ids, cursor_item_id } = this.props
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
        const { dispatch, list_key, issue_ids, selected_ids, cursor_item_id } = this.props
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
        const {dispatch, visible_item_ids} = this.props
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
        const {visible_item_ids, issues, expanded_issues} = this.props
        let issue_ids_to_select = [target_issue_id]
        let running_issue_index = indexOf(visible_item_ids, target_issue_id)
        let issue = issues[running_issue_index]
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
            if ( issue.parent_group_id == parent_group_id ) {
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

        if ( issue_ids_to_select.length == 0 ) {
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

    openTagEditor(event) {
        const {selected_ids} = this.props
        event.stopPropagation()
        if (selected_ids.length === 0) {
            alert("Please select at least one issue to tag")
            return
        }

        this.setState({'tag_editor_open': true})
    }

    closeTagEditor() {
        this.setState({'tag_editor_open': false})
    }

    openEstimateEditor(event) {
        const {selected_ids} = this.props
        event.stopPropagation()
        if (selected_ids.length === 0) {
            alert("Please select at least one issue to estimate")
            return
        }
        this.setState({'estimate_editor_open': true})
    }

    closeEstimateEditor() {
        this.setState({'estimate_editor_open': false})
    }

    reorderIssue(index_of_row_being_moved, original_index_of_destination) {
        const {dispatch, list_key, visible_item_ids} = this.props

        let index_of_destination = original_index_of_destination
        
        if ( index_of_row_being_moved > index_of_destination ) {
            index_of_destination -= 1;
        }
        
        const moving_issue_id = visible_item_ids[index_of_row_being_moved]
        const move_after_issue_id = (index_of_destination>=0 && visible_item_ids[index_of_destination]) || null
        
        let selected_ids = this.props.selected_ids || []
        if ( ! includes(selected_ids, moving_issue_id) ) {
            selected_ids = [moving_issue_id]
        }
        selected_ids = uniq(concat(selected_ids, this.findHiddenIssuesRelatingToTargetIssueId(moving_issue_id)))

        const target_hidden_child_issue_ids = (move_after_issue_id && this.findHiddenIssuesRelatingToTargetIssueId(move_after_issue_id)) || [null]
        const target_issue_id = target_hidden_child_issue_ids[target_hidden_child_issue_ids.length-1]
        
        dispatch(reorderIssue(selected_ids, target_issue_id, list_key,
                              original_index_of_destination,
                              function () {
                                  dispatch(invalidateList(list_key))
                                  dispatch(fetchIssuesIfNeeded(list_key))
                              }))
    }

    renderHeader() {
        const { header_list } = this.props
        return (
            <div className="div-table__header_row">
              { map(header_list, (v, k) => (
                    <div key={k}
                         className="div-table__header_cell"
                         style={getCellStyle(v)}>
                      {v.label }
                    </div>
                ))}
            </div>
        )
    }

    render_collapsed() {

        const {
            selected_items,
            selected_ids, highlighted_ids, loading_item_ids, list_key,
            expanded_issues, cursor_item_id
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
                        onClickedIssue={(event) => this.onClickedIssue(event, issue.id)}
                        is_loading={loading_item_ids.indexOf(issue.id) !== -1}
                        is_selected={selected_ids.indexOf(issue.id) !== -1}
                        is_highlighted={highlighted_ids.indexOf(issue.id) !== -1}
                        is_cursor_item={""+issue.id==""+cursor_item_id}
                        issue_id={issue.id}
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

    render_expanded() {

        const {
            issues, is_visible, list_key,
            saving_issue_ids,
            is_creating_issue, candidate_issue, invalidated_issue_ids,
            selected_ids, highlighted_ids, selected_items, loading_item_ids, expanded_issues,
            header_list, cursor_item_id
        } = this.props

        const tag_editor_open = (this.state || {}).tag_editor_open || false
        const estimate_editor_open = (this.state || {}).estimate_editor_open || false

        if (!is_visible) {
            return (<div></div>)
        }
        const that = this
        // const at_least_one_issue_selected = selected_ids && selected_ids.length > 0

        const issue_rows = []
        let running_parent_issue_id = null
        each(issues, function (issue, index) {

            if (is_creating_issue && index === 0 && !candidate_issue.issue_id_before) {
                issue_rows.push(that.render_candidate_issue())
            }

            const show_issue = !issue.parent_group_id || includes(expanded_issues, issue.parent_group_id)

            if (issue.parent_group_id && issue.parent_group_id !== running_parent_issue_id) {
                // this happens if the issue is separated from its group parent by another issue,
                // so insert a 'fake' feature issue
                issue_rows.push(
                    <Issue
                        key={list_key + issue.id + "fakefeature" + running_parent_issue_id}
                        is_fake={true}
                        list_key={list_key}
                        is_collapsed={false}
                        show_children={includes(expanded_issues, issue.id)}
                        onClickedIssue={(event) => that.onClickedIssue(event, issue.parent_group_id)}
                        is_loading={loading_item_ids.indexOf(issue.parent_group_id) !== -1}
                        is_selected={selected_ids.indexOf(issue.parent_group_id) !== -1}
                        is_highlighted={highlighted_ids.indexOf(issue.parent_group_id) !== -1}
                        is_cursor_item={""+issue.id==""+cursor_item_id}
                        is_invalidated={invalidated_issue_ids.indexOf(issue.parent_group_id) !== -1}
                        is_saving={saving_issue_ids.indexOf(issue.issue_parent_group_id) !== -1}
                        issue_id={issue.parent_group_id}
                        subject_prefix="...(continued) "
                        header_list={header_list}
                        onDelete={that.onDeleteIssue}
                    />
                )
                running_parent_issue_id = issue.parent_group_id
            }

            if (show_issue) {
                issue_rows.push(
                    <Issue
                        key={list_key + issue.id}
                        list_key={list_key}
                        is_collapsed={false}
                        show_children={includes(expanded_issues, issue.id)}
                        onClickedIssue={(event) => that.onClickedIssue(event, issue.id)}
                        is_loading={loading_item_ids.indexOf(issue.id) !== -1}
                        is_selected={selected_ids.indexOf(issue.id) !== -1}
                        is_highlighted={highlighted_ids.indexOf(issue.id) !== -1}
                        is_cursor_item={""+issue.id==""+cursor_item_id}
                        is_invalidated={invalidated_issue_ids.indexOf(issue.id) !== -1}
                        is_saving={saving_issue_ids.indexOf(issue.id) !== -1}
                        issue_id={issue.id}
                        header_list={header_list}
                        onDelete={that.onDeleteIssue}
                    />
                )
            }

            if (is_creating_issue && candidate_issue.issue_id_before === issue.id) {
                issue_rows.push(that.render_candidate_issue())
            }

            if (issue.can_group_issues) {
                running_parent_issue_id = issue.id
            } else {
                running_parent_issue_id = issue.parent_group_id
            }
            return
        })

        if ( issue_rows.legnth === 0 ) {
            issue_rows.push(
                <div className="div-table__row">
                  <div className="div-table__cell">No issues</div>
                </div>
            )
        }
        
        return (

            <div>
              <TagEditor isOpen={tag_editor_open}
                         selected_items={selected_items}
                         selected_ids={selected_ids}
                         closeTagEditor={this.closeTagEditor}/>
              <EstimateEditor isOpen={estimate_editor_open}
                              selected_items={selected_items}
                              selected_ids={selected_ids}
                              closeEstimateEditor={this.closeEstimateEditor}/>

              <DivTable renderHeader={this.renderHeader}
                        onReorder={this.reorderIssue}>
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
            <Shortcuts name='ISSUE_LIST' handler={this.handleShortcuts} >
              <div>
                { is_collapsed && this.render_collapsed() }
                { is_expanded && this.render_expanded() }
              </div>
            </Shortcuts>
        )
    }
}

function mapStateToProps(state, props) {
    const {issue, item_list} = state
    const {list_key, issue_header_list} = props
    const items_by_id = (issue && issue.items_by_id) || {}
    const l = (item_list && item_list[list_key]) || {}
    const filter = l.filter || {}
    const sprint_id = filter.sprint_id || null
    const visible_item_ids = l.visible_item_ids || []
    const invalidated_item_ids = (issue && issue.invalidated_item_ids) || []
    const saving_item_ids = (issue && issue.saving_item_ids) || []

    const selected_items = items_by_id && l.selected_ids && l.selected_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {
            'id': selected_id,
            'loaded': false
        }
    })

    const highlighted_items = items_by_id && l.highlighted_ids && l.highlighted_ids.map(function (highlighted_id, index) {
        return items_by_id[highlighted_id] || {
            'id': highlighted_id,
            'loaded': false
        }
    })

    const items = (items_by_id && visible_item_ids.map(function (visible_item_id, index) {
        return items_by_id[visible_item_id] || {
            'id': visible_item_id,
            'loaded': false
        }
    })) || []

    const candidate_issue = (issue && issue.candidate_issue) || null
    const is_creating_issue = candidate_issue || false
    const cursor_item_id = getCursorItemId(state, list_key)

    return {
        list_key: list_key,
        visible_item_ids,
        sprint_id: sprint_id,
        issues: items,
        issue_ids: map(items, 'id'),
        selected_ids: l.selected_ids || [],
        highlighted_ids: l.highlighted_ids || [],
        cursor_item_id,
        invalidated_issue_ids: invalidated_item_ids,
        saving_issue_ids: saving_item_ids,
        selected_items: selected_items || [],
        loading_item_ids: l.loading_item_ids || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
        is_collapsed: l.display_mode === "collapsed",
        is_expanded: l.display_mode === "expanded" || !l.display_mode,
        last_updated: l.last_updated,
        is_visible: sprint_id || (visible_item_ids && visible_item_ids.length > 0) || false,
        candidate_issue: candidate_issue,
        is_creating_issue: is_creating_issue,
        expanded_issues: l.flag_expanded_issues,
        header_list: issue_header_list
    }
}

export default connect(mapStateToProps)(IssueList)
