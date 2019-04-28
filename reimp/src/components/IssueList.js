import React, {Component} from 'react'
import { flatMap, keys, groupBy, filter, keyBy, size, uniq, concat, indexOf, map, difference, includes } from 'lodash'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { default_theme as theme } from '../theme/default'
import styled from 'react-emotion'
import Floater from "react-floater"
import {connect} from 'react-redux'
import { ensureSprintsLoaded, getSprint } from '../actions/Sprints'
import { logged_in_user } from '../actions/Auth'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'
import CommonTable from './CommonTable'
import 'react-virtualized/styles.css';
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
import { selGetAllTagsById } from '../selectors/IssueSelectors'
import {
    initList,
    invalidateList,
    setItemFlag,
    setCursorItem,
    getCursorItemId,
    getVisibleItemIds,
    getSelectedItemIds,
    getHighlightedItemIds,
    getItemFlag,
    getLastUpdated,
    isLoading,
    getListFilter
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
    ensureIssuesLoaded,
    deleteIssues,
    ALL_AVAILABLE_ISSUE_HEADERS,
} from '../actions/Issues'
import {
    HEADER_LIST_NAME__ISSUE
 } from '../actions/ItemListKeyRegistry'
import { ensureTagsLoaded } from '../actions/Tags'
import DeleteIssue from './DeleteIssue'
import DivTableCell from './DivTableCell'
// import { Shortcuts } from 'react-shortcuts'
import { setGloballySelectedIssueId } from '../actions/Page'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueEstimate from './EditableIssueEstimate'
import Timestamp from './Timestamp'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import Hours from './Hours'
import Progress from './Progress'
import TagListFlat from './TagListFlat'

const IconStyle = {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: '24px 24px',
    height: '24px',
    width: '24px',
}

const AttachmentIconUrl = require(`../images/attachment.png`)
const AttachmentIconDiv = styled('div')(props => Object.assign(IconStyle,
                                                               {backgroundImage: `url(${AttachmentIconUrl})`,
                                                                backgroundSize: '15px 15px',
                                                                height: '15px',
                                                                width: '15px'}
))

const ChildIconUrl = require(`../images/ic_subdirectory_arrow_right_black_24dp_1x.png`)
const ChildIconDiv = styled('div')(props => Object.assign(IconStyle,
                                                          {backgroundImage: `url(${ChildIconUrl})`,
                                                           opacity: '0.2'},
                                                          ({belongsToSelectedFeature=false}) => ({
                                                              opacity: belongsToSelectedFeature ? '1.0' : '0.2'
                                                          })
))

class IssueList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.onClickedIssue = this.onClickedIssue.bind(this)
        this.reorderIssue = this.reorderIssue.bind(this)
        this.toggleAsFeature = this.toggleAsFeature.bind(this)
        this.toggleExpandFeatures = this.toggleExpandFeatures.bind(this)
        this.groupTogether = this.groupTogether.bind(this)
        this.ungroupTogether = this.ungroupTogether.bind(this)
        this.handleShortcuts = this.handleShortcuts.bind(this)
        this.onDeleteIssue = this.onDeleteIssue.bind(this)
    }

    componentDidMount() {
        const {dispatch, selected_ids, list_key, sprint_id,
               feature_issue_ids, tag_ids, issues_by_id} = this.props
        if (sprint_id) {
            dispatch(initList(list_key))
            dispatch(fetchIssuesIfNeeded(list_key))
            dispatch(ensureIssuesLoaded(feature_issue_ids))
            dispatch(ensureSprintsLoaded([sprint_id]))
            dispatch(ensureTagsLoaded(tag_ids))
        }
        this.ensure_issues_are_visible(selected_ids, issues_by_id, list_key)
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, selected_ids, issues_by_id} = this.props
        const { feature_issue_ids, tag_ids, sprint_id } = new_props
        const {onSelectIssues} = this.props
        if ( this.props.sprint_id !== new_props.sprint_id ) {
            onSelectIssues([])
        }
        if ( selected_ids !== new_props.selected_ids || issues_by_id !== new_props.issues_by_id ) {
            this.ensure_issues_are_visible(new_props.selected_ids, new_props.issues_by_id, list_key)
        }
        dispatch(fetchIssuesIfNeeded(list_key))
        dispatch(ensureIssuesLoaded(feature_issue_ids))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureTagsLoaded(tag_ids))
    }

    ensure_issues_are_visible(issue_ids, issues_by_id, list_key) {
        const { dispatch, expanded_issues } = this.props
        let expand_these_issues = []
        map(issue_ids, function(issue_id) {
            const issue = issues_by_id[issue_id]
            if ( issue && issue.parent_group_id ) {
                expand_these_issues.push(issue.parent_group_id)
            }
        })
        if ( difference(expand_these_issues, expanded_issues).length > 0 ) {
            dispatch(setItemFlag(list_key, expand_these_issues, 'expanded_issues', true))
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

    onSelectedIssues = (issue_ids) => {
        const { onSelectIssues } = this.props
        if ( onSelectIssues ) {
            onSelectIssues(issue_ids)
        }
    }

    onClickedIssue(issue_id) {
        const { dispatch, sprint_id, project_id } = this.props
        dispatch(setGloballySelectedIssueId(project_id, sprint_id, issue_id))
        dispatch(setActivelyAvailableAutoClockEntity(project_id, sprint_id, issue_id))
        dispatch(cancelCandidateIssue())
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

    onOpenIssueInSprint = (event, issue) => {
        const { history, onAction } = this.props
        event.stopPropagation()
        history.push('/projects/'+issue.project_id+'/sprints/'+issue.sprint_id+'/issues/'+issue.id);
        if ( onAction ) {
            onAction("view_in_sprint", issue)
        }
    }

    onDeleteIssue = (event, issue) => {
        const { dispatch, onDelete } = this.props
        event.stopPropagation()

        if ( issue.actual_hours > 0 ) {
            window.alert("This issue has time against it and so can't be deleted")
            return
        }
        
        if ( ! window.confirm( "Delete issue " + issue.number + " - " + issue.subject + "?") ) {
            return
        }
        dispatch(deleteIssues([issue.id]))
        if ( onDelete ) {
            onDelete(issue.id)
        }
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
        selected_ids = uniq(concat(selected_ids, [moving_issue_id]))

        // get place to move it
        let move_after_issue_id
        if ( index_of_row_being_moved > index_of_destination ) {
            move_after_issue_id = (index_of_destination>0 && issue_items[index_of_destination-1].id) || null
        } else {
            move_after_issue_id = issue_items[index_of_destination].id || null
        }

        const target_hidden_child_issue_ids = (move_after_issue_id && [move_after_issue_id]) || [null]
        const target_issue_id = target_hidden_child_issue_ids[target_hidden_child_issue_ids.length-1]


        dispatch(reorderIssue(selected_ids, target_issue_id, list_key,
                              index_of_destination,
                              function () {
                                  dispatch(invalidateList(list_key))
                                  dispatch(fetchIssuesIfNeeded(list_key))
                              }))
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

    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex, activeHeaders}) => {
        const { sprint, issue_items, logged_in_user_id, selected_items,
                tag_category_names, all_tags_by_id, logged_in_user_can_estimate_user_id } = this.props
        const key = `issue_${columnIndex}_${rowIndex}`
        const that = this
        const header = activeHeaders[columnIndex]
        const header_key = header.key
        const item = issue_items[rowIndex]
        if ( item.type === "candidate" ) {
            return  (
                <DivTableCell key={key}
                              extra_style={css`background-color:${theme.colours.new_item_background}`}>
                  { header_key === "name" && "Creating issue..." }
                  { header_key !== "name" && <span>&nbsp;</span> }
                </DivTableCell>
            )
        }
        
        const issue = item.issue
        const all_actuals_by_user_id = keyBy(issue.all_actuals, (o) => ""+o.user_id)
        const all_estimates_by_user_id = keyBy(issue.all_estimates, (o) => ""+o.user_id)
        let content = null

        if ( isScrolling ) {
            const NON_SCROLLING_FIELDS = []
            if ( includes(NON_SCROLLING_FIELDS, header_key) ) {
                return (
                    <DivTableCell key={key}>
                      null
                    </DivTableCell>
                )
            }
        }
        
        switch(header_key) {
            case "number":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{issue.number}</div>
                    </DivTableCell>
                )
                break
            case "issue_type":
                const cell = (<div className={"issue-cell__issue-" + issue.type_name + "-icon"}></div>)
                content = cell
                let tooltip = null
                let title = null

                if ( issue.type_name === "adhoc" ) {
                    title = "Adhoc"
                    tooltip = (<div>Adhoc issues are created by external timesheets where the issue type is not known. 
                      Please change the issue type to be more specific.
                    </div>)
                } else if ( issue.type_name === "management-general" ) {
                    title = "General management"
                    tooltip = (<div>General management.</div>)
                } else if ( issue.type_name === "management-meeting" ) {
                    title = "Meetings"
                    tooltip = (<div>Used to schedule and clock meetings</div>)
                } else if ( issue.type_name === "management-spec" ) {
                    title = "Specifications"
                    tooltip = (<div>Creating issues and technical planning.</div>)
                } else if ( issue.type_name === "management-finance" ) {
                    title = "Finance"
                    tooltip = (<div>For tracking reconciliations, invoicing and statements.</div>)
                } else if ( issue.type_name === "management-assign" ) {
                    title = "Assigning issues"
                    tooltip = (<div>For assigning issues to appropriate users.</div>)
                } else if ( issue.type_name === "management-estimate" ) {
                    title = "Estimating issues"
                    tooltip = (<div>For estimating issues.</div>)
                } else if ( issue.type_name === "management-testables" ) {
                    title = "Writing testables"
                    tooltip = (<div>For writing testables. Sometimes covered by management-spec issues.</div>)
                }
                if ( tooltip ) {
                    content = (
                        <Floater title={title}
                                 disableHoverToClick
                                 event="hover"
                                 eventDelay={0}
                                 placement="bottom"
                                 content={tooltip}
                        >
                          {cell}
                        </Floater>
                    )
                }
                content = (
                    <DivTableCell key={key}
                                   >
                      {content}
                    </DivTableCell>
                )
                break
            case "attachment":
                content = (
                    <DivTableCell key={key}
                    >
                      {
                          issue.has_attachment && <AttachmentIconDiv></AttachmentIconDiv>
                      }
                    </DivTableCell>
                )
                break
            case "problems":
                const issue_has_problems = (issue.needs_testables && (size(issue.testables) === 0 ||
                                                                      issue.needs_estimate ||
                                                                      issue.assigned_to_id === null ||
                                                                      issue.estimate_too_large))
                content = (
                    <DivTableCell className="div-table__cell" key={key}
                    >
                      { issue_has_problems && (
                            <Floater
                                title="Issue problems"
                                disableHoverToClick
                                event="hover"
                                eventDelay={0}
                                placement="right"
                                content={
                                    <div>
                                      { size(issue.testables) === 0 &&
                                        <div className="floater__section">
                                          <div>
                                            This issue is missing testables and should not be worked on yet.
                                          </div>
                                        </div>
                                      }
                                      { issue.assigned_to_id === null &&
                                        <div className="floater__section">
                                          <div>
                                            This issue has no assigned user.
                                          </div>
                                        </div>
                                      }
                                      { issue.assigned_to_id !== null && issue.needs_estimate &&
                                        <div className="floater__section">
                                          <div>
                                            This issue is missing an estimate by the assigned user and should not be worked on yet.
                                          </div>
                                        </div>
                                      }
                                      { issue.estimate_too_large &&
                                        <div className="floater__section">
                                          <div>
                                            Your estimate too large and should be reduced.
                                          </div>
                                        </div>
                                      }
                                    </div>
                                }
                                >
                              <div className="icon icon--warning"></div> 
                            </Floater>
                      )}
                      { size(issue.needs_open_issues_ids) > 0 && (
                            <Floater
                                title="Issue warnings"
                                disableHoverToClick
                                event="hover"
                                eventDelay={0}
                                placement="right"
                                content={
                                    <div>
                                      <div className="floater__section">
                                        <div>
                                          This issue needs other issues that are still open.
                                        </div>
                                      </div>
                                    </div>
                                }>
                              <div className="icon icon--unresolved_dependancy"></div> 
                            </Floater>        
                      )}
                    </DivTableCell>
                )
                break
            case "expand_feature":
                // This column is deprecated
                const isChildOfSelectedFeature = includes(flatMap(selected_items, function(o) { return map(o.group_children, function(id) { return "" + id }) }), "" + issue.id)
                const isSiblingOfSelectedIssue = includes(keys(keyBy(selected_items, 'parent_group_id')), issue.parent_group_id)
                const belongsToSelectedFeature = isChildOfSelectedFeature || isSiblingOfSelectedIssue
                content = (
                    <DivTableCell key={key}
                    >
                      { !issue.can_group_issues && issue.parent_group_id &&
                        <ChildIconDiv belongsToSelectedFeature={belongsToSelectedFeature}></ChildIconDiv>
                      }
                    </DivTableCell>
                )
                break
            case "name":
                content = (
                    <DivTableCell key={key} >
                      {issue.subject}
                      {/* { issue.group_children && issue.group_children.length > 0 &&
                      <span>
                      ({issue.group_children.length}
                      {issue.group_children.length === 1 && <span>child</span>}
                      {issue.group_children.length > 1 && <span>children</span>}
                      )
                      </span>
                      } */}
                    </DivTableCell>
                )
                break
            case "assignee":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      <EditableIssueAssignedUser class_name="issue-cell__assignee"
                                                 issue_ids={[issue.id]}
                                                 project_id={issue.project_id}/>
                    </DivTableCell>
                )
                break
            case "project":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                    >
                      <ProjectName project_id={issue.project_id} />
                    </DivTableCell>
                )
                break
            case "sprint":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                    >
                      <SprintName sprint_id={issue.sprint_id} />
                    </DivTableCell>
                )
                break
            case "due_date":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                    >
                      <Timestamp value={issue.due_date} format="from_now" />
                    </DivTableCell>
                )
                break
            case "created_at":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      <Timestamp value={issue.created_at} format="from_now"/>
                    </DivTableCell>
                )
                break
            case "status":
                content = (
                    <DivTableCell key={key}
                                  secondary={true} >
                      <EditableIssueStatus class_name="issue-cell__status" issue_ids={[issue.id]} project_id={issue.project_id}/>
                    </DivTableCell>
                )
                break
            case "tags":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      <div className="issue-cell__tag">
                        <TagListFlat issue_ids={[issue.id]} can_edit={false} />
                      </div>
                    </DivTableCell>
                )
                break
            case "tag_columns":

                const issue_tag_ids = issue.tag_ids
                const tags = filter(all_tags_by_id, (tag) => includes(issue_tag_ids, tag.id))
                const tagsByCategoryName = groupBy(tags, 'category_name')
                content = (
                    map(tag_category_names, function(tag_category_name) {

                        const tags = tagsByCategoryName[tag_category_name]
                        return (
                            <DivTableCell key={header_key+tag_category_name}
                                          secondary={true}
                                          >
                              { map(tags, (tag) =>
                                  <div key={tag.id} className="issue-cell__tag_column">
                                    {tag.name}
                                  </div>
                                )}
                            </DivTableCell>
                        )
                    })

                )
                break
            case "estimate_summary":
                const user_id = issue.assigned_to_id
                content = (
                    <DivTableCell key={user_id} secondary={true} >

                      <EditableIssueEstimate issue_id={issue.id}
                                             actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                             class_name="issue-cell__my-estimate"
                                             renderReadOnly={() => <Progress issue={issue}
                                                                               force_show={true}
                                                                               actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                                                               estimate={(all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null} />}
                      />
                    </DivTableCell>
                )
                break
            case "estimate_columns":
                content = (
                    map(sprint.user_ids_who_can_estimate, (user_id) =>
                        <DivTableCell key={user_id}
                                      secondary={true}
                                      >
                          {logged_in_user_id === user_id &&
                           <EditableIssueEstimate issue_id={issue.id}
                                                  actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                                  class_name="issue-cell__my-estimate"/> }

                           {logged_in_user_id !== user_id &&
                            <Progress issue={issue}
                                      actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                      estimate={(all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null} />
                           }
                        </DivTableCell>
                    )
                )
                break
            case "my_estimate":
                const actual = (all_actuals_by_user_id[logged_in_user_id] && all_actuals_by_user_id[logged_in_user_id].hours) || null
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      {logged_in_user_can_estimate_user_id &&
                       <EditableIssueEstimate issue_id={issue.id}
                                              actual={actual}
                                              class_name="issue-cell__my-estimate"
                                              renderReadOnly={() => <Progress issue={issue}
                                                                              force_show={true}
                                                                              actual={(all_actuals_by_user_id[logged_in_user_id] && all_actuals_by_user_id[logged_in_user_id].hours) || null}
                                                                              estimate={(all_estimates_by_user_id[logged_in_user_id] && all_estimates_by_user_id[logged_in_user_id].estimate_hours) || null} />}
                       />
                      }
                      {!logged_in_user_can_estimate_user_id &&
                        <Hours hours={actual} />
                      }
                    </DivTableCell>
                )
                break
            case "estimated":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      <EditableIssueEstimate class_name="issue-cell__my-estimate" issue_id={issue.id} />
                    </DivTableCell>
                )
                break
            case "my_time":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      <Hours hours={issue.my_actual_hours} />
                    </DivTableCell>
                )
                break
            case "delete":
                content = (
                    <DivTableCell key={key} secondary={true}>
                      <div className="reveal-on-hover--block issue__cell--issue-delete">
                        <DeleteIssue
                            onDelete={(event) => that.onDeleteIssue(event, issue)}
                        />
                      </div>
                    </DivTableCell>
                )
                break
            case "small_delete":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                                  >
                      <div className={"reveal-on-hover--block"}>
                        <div className="issue__small-delete-image" onClick={(event) => that.onDeleteIssue(event, issue)} />
                      </div>
                    </DivTableCell>
                )
                break
            case "view_in_sprint":
                content = (
                    <DivTableCell key={key}
                                  secondary={true}
                    >
                      <div className={"reveal-on-hover--block"}>
                        <Floater title="Open issue"
                                 disableHoverToClick
                                 event="hover"
                                 eventDelay={0}
                                 placement="bottom"
                                 content="Open this issue in its sprint"
                        >
                          <div className="icon--open" onClick={(event) => that.onOpenIssueInSprint(event, issue)} />
                        </Floater>
                      </div>
                    </DivTableCell>
                )
                break
            default:
                console.error("Unknown header: " + header_key)
        }
        
        return (
            <div key={key}>
              {content}
            </div>
        )
    }

    render_grid() {

        const { is_mien_configurer_active, all_headers, header_list_name,
                issue_items, selected_ids, table_params } = this.props

        if ( is_mien_configurer_active ) {
            return this.renderListColumnConfigurer()
        }

        if ( issue_items.length === 0 ) {
            return (
                <div className="div-table__row">
                  <div className="div-table__cell">No issues</div>
                </div>
            )
        }

        /* const issue_rows = []
         * each( issue_items, function(issue_item, index) {
         *     if ( ! issue_item ) {
         *         console.error("Unexpected: issue_item should not be null")
         *     } else if ( issue_item.type === "candidate" ) {
         *         issue_rows.push(that.render_candidate_issue())
         *     } else if ( issue_item.type === "feature" ) {
         *         issue_rows.push(that.renderIssue(issue_item.issue, index))
         *     } else if ( issue_item.type === "issue" ) {
         *         issue_rows.push(that.renderIssue(issue_item.issue, index))
         *     }
         * })*/

        return (
              <CommonTable all_headers={all_headers}
                           header_list_name={header_list_name}
                           onRowSelected={this.onClickedIssue}
                           onRowSelectionUpdated={this.onSelectedIssues}
                           onRowReordered={this.reorderIssue}
                           items={issue_items}
                           selected_item_ids={selected_ids}
                           renderCell={this.renderCell}
                           table_params={table_params}
              />
        )
    }

    render() {

        return this.render_grid()
        
        /* return (
         *     <Shortcuts name='ISSUE_LIST' handler={this.handleShortcuts}>
         *       <div>
         *         { this.render_grid() }
         *       </div>
         *     </Shortcuts>
         * )*/
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
        const {list_key, table_params, onAction, custom_issue_header_list, custom_issue_header_list_name} = props
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
        const expanded_issues = getItemFlag(state, list_key, "flag_expanded_issues")
        const autoexpanded_feature_ids = getItemFlag(state, list_key, "flag_autoexpanded_feature_ids")
        const issue_items = selIssueObjectsToRender(state, props)
        const tag_category_names = selTagCategoryNamesForIssues(state, props)
        const all_tags_by_id = selGetAllTagsById(state, props)
        const logged_in_user_id = logged_in_user(state).user_id
        const logged_in_user_can_estimate_user_id = (includes(sprint.user_ids_who_can_estimate, logged_in_user_id) && logged_in_user_id) || null
        const issue_ids = selIssueIds(state, props)
        const all_headers = custom_issue_header_list || ALL_AVAILABLE_ISSUE_HEADERS
        const header_list_name = custom_issue_header_list_name || HEADER_LIST_NAME__ISSUE

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
            last_updated: getLastUpdated(state, list_key),
            candidate_issue: candidate_issue,
            is_creating_issue: is_creating_issue,
            expanded_issues: expanded_issues,
            autoexpanded_feature_ids,
            tag_ids,
            all_tags_by_id,
            tag_category_names,
            logged_in_user_id,
            logged_in_user_can_estimate_user_id,
            table_params,
            onAction,
            all_headers,
            header_list_name
        }
    }
    return mapStateToProps
}

export default withRouter(connect(makeMapStateToProps)(IssueList))
