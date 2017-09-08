import React, {Component} from 'react'
import each from 'lodash/each'
import map from 'lodash/map'
import keys from 'lodash/keys'
import union from 'lodash/union'
import includes from 'lodash/includes'
import difference from 'lodash/difference'
import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'
import {connect} from 'react-redux'
import TagEditor from '../components/TagEditor'
import EstimateEditor from '../components/EstimateEditor'
import {
    initList,
    invalidateList,
    collapse_list,
    expand_list,
    setItemFlag
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
import ListTable from './ListTable'

class IssueList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onCollapse = this.onCollapse.bind(this)
        this.onExpand = this.onExpand.bind(this)
        this.onClickedIssue = this.onClickedIssue.bind(this)
        this.reorderIssue = this.reorderIssue.bind(this)
        this.onStartCandidateIssue = this.onStartCandidateIssue.bind(this)
        this.onSaveCandidateIssue = this.onSaveCandidateIssue.bind(this)
        this.onCancelCandidateIssue = this.onCancelCandidateIssue.bind(this)
        this.toggleAsFeature = this.toggleAsFeature.bind(this)
        this.toggleExpandFeatures = this.toggleExpandFeatures.bind(this)
        this.groupTogether = this.groupTogether.bind(this)
        this.ungroupTogether = this.ungroupTogether.bind(this)
        this.openTagEditor = this.openTagEditor.bind(this)
        this.closeTagEditor = this.closeTagEditor.bind(this)
        this.openEstimateEditor = this.openEstimateEditor.bind(this)
        this.closeEstimateEditor = this.closeEstimateEditor.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, sprint_id} = this.props
        if (sprint_id) {
            dispatch(initList(list_key))
            dispatch(fetchIssuesIfNeeded(list_key))
            console.log(list_key)
        }
    }

    componentWillReceiveProps() {
        const {dispatch, list_key} = this.props
        dispatch(fetchIssuesIfNeeded(list_key))
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
        const {onSelectIssues, selected_ids} = this.props
        event.stopPropagation()

        let selected_issue_ids = []
        if (event.ctrlKey) {
            if (includes(selected_ids, issue_id)) {
                selected_issue_ids = difference(selected_ids, [issue_id])
            } else {
                selected_issue_ids = union(selected_ids, [issue_id])
            }
        } else {
            selected_issue_ids = [issue_id]
        }
        onSelectIssues(selected_issue_ids)
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

    onStartCandidateIssue(event) {
        const {dispatch, list_key} = this.props
        event.stopPropagation()
        dispatch(startCandidateIssue(list_key))
    }

    onSaveCandidateIssue(obj) {
        const {dispatch} = this.props
        dispatch(updateCandidateSubject(obj.candidate_issue_subject))
        dispatch(saveCandidateIssue())
    }

    onCancelCandidateIssue() {
        const {dispatch} = this.props
        dispatch(cancelCandidateIssue())
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

    reorderIssue(moving_issue_id, move_after_issue_id) {
        const {dispatch, list_key} = this.props
        console.log("Moving " + moving_issue_id + " to after " + move_after_issue_id)
        dispatch(reorderIssue(moving_issue_id, move_after_issue_id,
            function () {
                dispatch(invalidateList(list_key))
                dispatch(fetchIssuesIfNeeded(list_key))
            }))
    }

    render_collapsed() {

        const {
            selected_items,
            selected_ids, loading_item_ids, list_key,
            expanded_issues
        } = this.props

        return (
            <div className="panel panel--collapsed">
                <div className="panel-heading" onClick={this.onExpand}>
                    <div className="panel__title">{ selected_items.map((issue, index) =>
                        <Issue
                            key={list_key + issue.id + index}
                            is_collapsed={true}
                            show_children={includes(expanded_issues, issue.id)}
                            reorderIssue={this.reorderIssue}
                            onClickedIssue={(event) => this.onClickedIssue(event, issue.id)}
                            is_loading={loading_item_ids.indexOf(issue.id) !== -1}
                            is_selected={selected_ids.indexOf(issue.id) !== -1}
                            issue_id={issue.id}/>
                    )}
                    </div>
                </div>
            </div>
        )
    }

    render_candidate_issue() {

        const {list_key} = this.props

        return (
            <tr key={list_key + ".candidate_issue"} className="issue_list__candidate_issue">
                <td colSpan="20">Creating new issue here</td>
                { false &&
                <td>
                    <RIEModeToggler initialValue=""
                                    propName="candidate_issue_subject"
                                    initialState="editing"
                                    onChange={this.onSaveCandidateIssue}
                                    onCancel={this.onCancelCandidateIssue}>
                        <RIEInput/>
                    </RIEModeToggler>
                </td>
                }
            </tr>
        )
    }

    render_expanded() {

        const {
            issues, is_visible, list_key,
            saving_issue_ids,
            is_creating_issue, candidate_issue, invalidated_issue_ids,
            selected_ids, selected_items, loading_item_ids, expanded_issues,
            issue_header_list
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
                        key={list_key + issue.id + index + "fakefeature"}
                        is_collapsed={false}
                        show_children={includes(expanded_issues, issue.id)}
                        reorderIssue={that.reorderIssue}
                        onClickedIssue={(event) => that.onClickedIssue(event, issue.parent_group_id)}
                        is_loading={loading_item_ids.indexOf(issue.parent_group_id) !== -1}
                        is_selected={selected_ids.indexOf(issue.parent_group_id) !== -1}
                        is_invalidated={invalidated_issue_ids.indexOf(issue.parent_group_id) !== -1}
                        is_saving={saving_issue_ids.indexOf(issue.issue_parent_group_id) !== -1}
                        issue_id={issue.parent_group_id}
                        subject_prefix="..."
                    />
                )
                running_parent_issue_id = issue.parent_group_id
            }

            if (show_issue) {
                issue_rows.push(
                    <Issue
                        key={list_key + issue.id + index}
                        is_collapsed={false}
                        show_children={includes(expanded_issues, issue.id)}
                        reorderIssue={that.reorderIssue}
                        onClickedIssue={(event) => that.onClickedIssue(event, issue.id)}
                        is_loading={loading_item_ids.indexOf(issue.id) !== -1}
                        is_selected={selected_ids.indexOf(issue.id) !== -1}
                        is_invalidated={invalidated_issue_ids.indexOf(issue.id) !== -1}
                        is_saving={saving_issue_ids.indexOf(issue.id) !== -1}
                        issue_id={issue.id}
                        issue_header_list={issue_header_list}
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

        const renderHeader = (() => {
            return (
                <tr className="list-table__headers">
                  { map(keys(issue_header_list),
                        function(header_key){
                            var header_name = issue_header_list[header_key]
                            return <th key={header_key} className="list-table__header">{header_name}</th>
                        })
                  }
                { false && <th className="list-table__header">Feature</th>} {/* These were here before mapping was introducted but may need to be removed */}
                { false && <th className="list-table__header">Sprint</th>}

                </tr>)
        })

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

                <ListTable renderHeader={renderHeader}>
                    {issue_rows.length > 0 && issue_rows}
                    {issue_rows.length === 0 &&
                     (
                         <tr>
                             <td colSpan="20">No issues</td>
                         </tr>
                     )}
                </ListTable>
            </div>

        )
    }

    render() {

        const {is_visible, is_collapsed, is_expanded} = this.props

        if (!is_visible) {
            return (<div></div>)
        }

        return (
            <div>
                { is_collapsed && this.render_collapsed() }
                { is_expanded && this.render_expanded() }
            </div>
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

    const items = (items_by_id && visible_item_ids.map(function (visible_item_id, index) {
            return items_by_id[visible_item_id] || {
                    'id': visible_item_id,
                    'loaded': false
                }
        })) || []

    const candidate_issue = (issue && issue.candidate_issue) || null
    const is_creating_issue = candidate_issue || false

    return {
        list_key: list_key,
        sprint_id: sprint_id,
        issues: items,
        issue_ids: map(items, 'id'),
        selected_ids: l.selected_ids || [],
        invalidated_issue_ids: invalidated_item_ids,
        saving_issue_ids: saving_item_ids,
        selected_items: selected_items || [],
        loading_item_ids: l.loading_item_ids || [],
        has_items: items && items.length > 0,
        is_loading: l.is_loading,
        is_collapsed: l.display_mode === "collapsed",
        is_expanded: l.display_mode === "expanded" || !l.display_mode,
        last_updated: l.last_updated,
        is_visible: sprint_id || false,
        candidate_issue: candidate_issue,
        is_creating_issue: is_creating_issue,
        expanded_issues: l.flag_expanded_issues,
        issue_header_list: issue_header_list
    }
}

export default connect(mapStateToProps)(IssueList)
