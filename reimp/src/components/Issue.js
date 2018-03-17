import React, {Component} from 'react'
import { keys, keyBy, map, includes, flatMap } from 'lodash'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { ENTITY_KEY__ISSUE, getCellStyle } from '../actions/ItemListKeyRegistry'
import { getSelectedItems, setItemFlag } from '../actions/ItemList'
import {
    updateIssueStatus,
    updateIssueFeature,
    updateIssueAssignedTo,
    deleteTag,
    getIssue,
    populateEstimates,
    clock,
    deleteIssues
} from '../actions/Issues'
import {
    makeSelEstimatesByUserId,
    makeSelActualsByUserId,
    makeSelIssueTagsByCategoryName
} from '../selectors/IssueSelectors'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {getProject} from '../actions/Projects'
import {
    ensureUsersLoaded,
    getUser
} from '../actions/Users'
import { ensureTagsLoaded, getTags } from '../actions/Tags'
import OtherUser from '../components/OtherUser'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueEstimate from './EditableIssueEstimate'
import Progress from '../components/Progress'
import IssueEstimatesSummary from '../components/IssueEstimatesSummary'
import TimerSwitch from '../components/TimerSwitch'
import ElapsedTime from '../components/ElapsedTime'
import DeleteIssue from '../components/DeleteIssue'
import TagListFlat from '../components/TagListFlat'
import {format_hours} from '../actions/lib'
import IssueStatusLabel from '../components/form/IssueStatusLabel'
import Timestamp from './Timestamp'
import { logged_in_user } from '../actions/Auth'

const ISSUE_STATUS_CHOICES = [
    {value: 'new', label: 'new'},
    {value: 'devdone', label: 'dev_done'},
    {value: 'in_internal_qa', label: 'internal qa'},
    {value: 'internal_qa_passed', label: 'internal qa passed'},
    {value: 'in_client_qa', label: 'external qa'},
    {value: 'client_qa_passed', label: 'external qa passed'},
    {value: 'reopened', label: 'reopened'},
    {value: 'onhold', label: 'on hold'},
    {value: 'bug', label: 'bug'},
    {value: 'to be estimated', label: 'to be estimated'},
    {value: 'needscodereview', label: 'needs code review'},
    {value: "cannot reproduce", label: "cannot reproduce"},
    {value: "discuss with client", label: "discuss with client"},
    {value: 'dev unclear', label: 'dev unclear'},
    {value: 'duplicate', label: 'duplicate'},
    {value: 'to be designed', label: 'to be designed'},
    {value: 'imported', label: 'imported'},
    {value: 'management', label: 'management'},
    {value: 'quick_clocker', label: 'quick clocker'}
]

class Issue extends Component {

    constructor(props) {
        super(props)
        this.onChangeStatus = this.onChangeStatus.bind(this)
        this.onDeleteTag = this.onDeleteTag.bind(this)
        this.onClockIn = this.onClockIn.bind(this)
        this.onClockOut = this.onClockOut.bind(this)
        this.onDeleteIssue = this.onDeleteIssue.bind(this)
        this.onCollapseFeaturesClick = this.onCollapseFeaturesClick.bind(this)
        this.onExpandFeaturesClick = this.onExpandFeaturesClick.bind(this)
        this.onClickedIssue = this.onClickedIssue.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    componentDidUpdate(prevProps) {
        Object.keys(this.props).forEach(key => {
            if (this.props[key] !== prevProps[key]) {
                console.log("Issue", key, "changed from", prevProps[key], "to", this.props[key]);
            }
        });
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, assignable_user_ids, issue} = props
        dispatch(ensureUsersLoaded(assignable_user_ids))
        dispatch(ensureTagsLoaded(issue.tag_ids || []))
        dispatch(ensureSprintsLoaded([issue.sprint_id]))
    }

    onChangeAssignedTo(issue_id, new_value) {
        const {dispatch} = this.props
        dispatch(updateIssueAssignedTo([issue_id], new_value))
    }

    onChangeStatus(issue_id, new_value) {
        const {dispatch} = this.props
        dispatch(updateIssueStatus([issue_id], new_value))
    }

    onChangeFeature(issue_id, new_value) {
        const {dispatch} = this.props
        dispatch(updateIssueFeature([issue_id], new_value))
    }

    onDeleteTag(tag) {
        const {issue, dispatch} = this.props
        dispatch(deleteTag([issue.id], tag.category_name, tag.name))
    }

    onClockIn() {
        const {issue, dispatch} = this.props
        dispatch(clock(issue.id, 'clock_in'))
    }

    onClockOut() {
        const {issue, dispatch} = this.props
        dispatch(clock(issue.id, 'clock_out'))
    }

    onDeleteIssue(event) {
        const { issue, dispatch, onDelete } = this.props
        event.stopPropagation()
        if ( ! confirm( "Delete issue " + issue.number + " - " + issue.subject + "?") ) {
            return
        }
        dispatch(deleteIssues([issue.id]))
        if ( onDelete ) {
            onDelete(issue.id)
        }
    }

    onCollapseFeaturesClick() {
        const {dispatch, issue_id, list_key} = this.props
        dispatch(setItemFlag(list_key, [issue_id], 'expanded_issues', false))
    }

    onExpandFeaturesClick() {
        const {dispatch, issue_id, list_key} = this.props
        dispatch(setItemFlag(list_key, [issue_id], 'expanded_issues', true))
    }

    render_collapsed() {
        const {issue, list_key} = this.props
        return (
            <div key={"collapsed_issue_" + issue.id + "_" + list_key}>
              {issue.number}
              {issue.subject}
            </div>
        )
    }

    onClickedIssue(event) {
        const { issue, onClickedIssue } = this.props
        onClickedIssue(event, issue.id)
    }

    render_expanded() {
        const {
            issue, is_selected, is_highlighted, assignable_user_ids,
            is_invalidated, is_saving, is_fake,
            isOver, connectDragSource, connectDropTarget, show_children,
            subject_prefix, subject_suffix,
            issue_id, header_list,
            isFeatureOfSelectedIssue, belongsToSelectedFeature, is_cursor_item, tag_category_names,
            tagsByCategoryName, all_estimates, all_estimates_by_user_id,
            all_actuals_by_user_id, sprint,
            logged_in_user_id, logged_in_user_can_estimate_user_id
        } = this.props

        const onDeleteTag = this.onDeleteTag
        const visible_header_keys = keys(header_list)

        if (!issue) {
            return (
                <div class="div-table__row">
                  <div class="div-table__cell">Loading...</div>
                </div>
            )
        }

        if (issue.loaded === false) {
            return (
                <div key={this.key + "." + issue.id}
                     onClick={this.onClickedIssue}
                     className={classNames("div-table__row", 'issue',
                                           {'div-table__row--selected': is_selected,
                                            'div-table__row--drop-target': isOver})}
                >
                  <div className="div-table__cell">
                    <div className="issue_list__issue_number_button">{issue.number}</div>
                  </div>
                  <div className="div-table__cell">Loading...</div>
                </div>
            )
        } else {
            const isFeature = issue.can_group_issues
            const belongsToAFeature = issue.parent_group_id || false
            const isStandalone = !isFeature && !belongsToAFeature

            return (
                <div key={this.key + "." + issue.id}
                     onClick={this.onClickedIssue}
                     className={classNames("div-table__row",
                                           'issue',
                                           'list-table__row--compact',
                                           {
                                               'div-table__row--selected': is_selected,
                                               'div-table__row--highlighted': is_highlighted,
                                               'div-table__row--drop-target': isOver,
                                               'issue--standalone': isStandalone,
                                               'issue--fake': is_fake===true,
                                               'issue--feature': isFeature,
                                               'issue--grouped': belongsToAFeature,
                                               'issue--cursor-item': is_cursor_item,
                                               'issue--feature-of-selected-issue': isFeatureOfSelectedIssue,
                                               'issue--belongs-to-selected-feature': belongsToSelectedFeature,
                                               /*'tr--selected': is_selected,*/
                                               'div-table__row--invalidated': is_invalidated,
                                               'div-table__row--saving': is_saving,
                                           })}
                >
                  {includes(visible_header_keys, "number") &&
                   <div className="div-table__cell"
                        style={getCellStyle(header_list.number)}>
                     <div>{issue.number}</div>
                   </div>
                  }
                 {includes(visible_header_keys, "adhoc") &&
                   <div className="div-table__cell"
                        style={getCellStyle(header_list.adhoc)} >
                     <div className={classNames({'issue-cell__issue-adhoc-icon':issue.type_name==='adhoc'})}></div>
                   </div>
                  }
                  {includes(visible_header_keys, "expand_feature") &&
                   <div className="div-table__cell"
                        style={getCellStyle(header_list.expand_feature)}>
                     { issue.can_group_issues &&
                       <div>
                         { show_children &&
                           <div className={classNames("icon--collapse",
                                                      {"icon--collapse--highlight":isFeatureOfSelectedIssue})}
                                onClick={this.onCollapseFeaturesClick}></div>
                         }
                         { !show_children &&
                           <div className="icon--expand" onClick={this.onExpandFeaturesClick}></div>
                         }
                       </div>
                     }
                     { !issue.can_group_issues && issue.parent_group_id &&
                       <div className={classNames({"icon--child":true,
                                                   "icon--child--highlight":belongsToSelectedFeature})}></div>
                     }
                   </div>
                  }
                  {includes(visible_header_keys, "name") &&
                   <div className="div-table__cell"
                        style={getCellStyle(header_list.name)}>
                     <div className="issue-cell__issue-name">
                       {subject_prefix}{issue.subject}{subject_suffix}
                       { issue.group_children && issue.group_children.length > 0 &&
                         <span>
                           ({issue.group_children.length}
                           {issue.group_children.length === 1 && <span>child</span>}
                           {issue.group_children.length > 1 && <span>children</span>}
                           )
                         </span>
                       }
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "assignee") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.assignee)}>
                     <EditableIssueAssignedUser class_name="issue-cell__assignee" issue_ids={[issue.id]} project_id={issue.project_id}/>
                   </div>
                  }
                  {includes(visible_header_keys, "created_at") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.created_at)}>
                     <div className="issue-cell__created-at">
                       <Timestamp value={issue.created_at} format="from_now"/>
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "status") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.status)}>
                     <EditableIssueStatus class_name="issue-cell__status" issue_ids={[issue.id]} project_id={issue.project_id}/>
                   </div>
                  }
                  {includes(visible_header_keys, "tags") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.tags)}>
                     <div className="issue-cell__tag">
                       <TagListFlat issue_ids={[issue.id]} can_edit={false} />
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "tag_columns") &&
                   map(tag_category_names, (tag_category_name) =>
                       <div key={tag_category_name}
                            className="div-table__cell issue__cell__secondary issue-cell__tag_column_container"
                            style={getCellStyle(header_list.tag_columns)}>
                         <div className="issue-cell__tag_column">
                           {(tagsByCategoryName[tag_category_name] || {}).name}
                         </div>
                       </div>
                   )
                  }
                {includes(visible_header_keys, "estimate_columns") &&
                 map(sprint.user_ids_who_can_estimate, (user_id) =>
                     <div key={user_id}
                          className="div-table__cell issue__cell__secondary"
                          style={getCellStyle(header_list.estimate_columns)}>
                       <div className="issue-cell__estimate_column">
                         {logged_in_user_id === user_id &&
                          <EditableIssueEstimate issue_id={issue.id}
                                                 actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].actual_hours) || null}
                                                 class_name="issue-cell__my-estimate"/> }

                          {logged_in_user_id !== user_id &&
                           <Progress issue={issue}
                                     actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                     estimate={(all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null} />
                          }
                       </div>
                     </div>
                 )
                }

                 {includes(visible_header_keys, "my_estimate") && logged_in_user_can_estimate_user_id &&
                  <div className="div-table__cell issue__cell__secondary"
                       style={getCellStyle(header_list.my_estimate)}>
                    <div className="issue-cell__estimate_column">
                      {logged_in_user_can_estimate_user_id &&
                       <EditableIssueEstimate issue_id={issue.id}
                                              class_name="issue-cell__my-estimate"/>
                      }
                    </div>
                  </div>
                 }
                     
                  {includes(visible_header_keys, "estimated") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.estimated)}>
                     <EditableIssueEstimate class_name="issue-cell__my-estimate" issue_id={issue.id} />
                   </div>
                  }
                  {includes(visible_header_keys, "my_time") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.my_time)}>
                     <div className="issue__cell--elapsed-time">
                       <ElapsedTime hours={issue.my_actual_hours} active={issue.am_i_clocked_in}/>
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "clock_in") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.clock_in)}>
                     <div className={classNames({'reveal-on-hover--block': !issue.am_i_clocked_in})}>
                       <TimerSwitch
                           active={issue.am_i_clocked_in}
                           onStart={this.onClockIn}
                           onStop={this.onClockOut}
                       />
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "delete") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.delete)}>
                     <div className="reveal-on-hover--block issue__cell--issue-delete">
                       <DeleteIssue
                           onDelete ={this.onDeleteIssue}
                       />
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "small_delete") &&
                   <div className="div-table__cell issue__cell__secondary"
                        style={getCellStyle(header_list.small_delete)}>
                     <div className={"reveal-on-hover--block"}>
                       <div className="issue__small-delete-image" onClick={this.onDeleteIssue} />
                     </div>
                   </div>
                  }
                </div>
            )
        }
    }

    render() {
        const {is_collapsed, is_expanded, isDragging} = this.props

        if ( isDragging ) {
            return null
        }

        if (is_collapsed) {
            return this.render_collapsed()
        }
        else if (is_expanded) {
            return this.render_expanded()
        } else {
            return ( <div>Dev error</div> )
        }
    }

}

const makeMapStateToProps = () => {
    const selEstimatesByUserId = makeSelEstimatesByUserId()
    const selActualsByUserId = makeSelActualsByUserId()
    const selIssueTagsByCategoryName = makeSelIssueTagsByCategoryName()
    const mapStateToProps = (state, props) => {
        
        const {
            issue_id, is_selected, is_highlighted, is_collapsed,
            is_loading, is_invalidated, is_saving, show_children, is_fake,
            subject_prefix, subject_suffix, header_list, list_key, is_cursor_item,
            onDelete, tag_category_names
        } = props

        const issue = getIssue(state, issue_id) || {'loaded': false}
        const project_id = issue.project_id
        const project = getProject(state, project_id) || {}
        const sprint_id = issue.sprint_id
        const sprint = getSprint(state, sprint_id) || {}
        const assignable_user_ids = project.allowed_user_ids || []
        const selectedIssues = getSelectedItems(state, list_key, ENTITY_KEY__ISSUE) || []
        populateEstimates(state, issue)

        // const feature_names = this_project.feature_names || []
        /* const feature_options = feature_names.map(
         *     function (feature_name) {
         *         return {'value': feature_name, 'label': feature_name}
         *     }
         * )*/

        const isParentOfSelectedIssue = includes(flatMap(selectedIssues, function(o) { return ["" + o.parent_group_id] }), "" + issue_id)
        const isSelectedFeature = is_selected && issue.can_group_issues
        const isFeatureOfSelectedIssue = isParentOfSelectedIssue || isSelectedFeature

        const isChildOfSelectedFeature = includes(flatMap(selectedIssues, function(o) { return map(o.group_children, function(id) { return "" + id }) }), "" + issue_id)
        const isSiblingOfSelectedIssue = includes(keys(keyBy(selectedIssues, 'parent_group_id')), issue.parent_group_id)
        const belongsToSelectedFeature = isChildOfSelectedFeature || isSiblingOfSelectedIssue
        const tags = getTags(state, issue.tag_ids || [])
        const tagsByCategoryName = selIssueTagsByCategoryName(state, props)
        const all_estimates = issue.all_estimates
        const all_estimates_by_user_id = selEstimatesByUserId(state, props)
        const all_actuals = issue.all_actuals
        const all_actuals_by_user_id = selActualsByUserId(state, props)
        const logged_in_user_id = logged_in_user().user_id
        const logged_in_user_can_estimate_user_id = (includes(sprint.user_ids_who_can_estimate, logged_in_user_id) && logged_in_user_id) || null

        return {
            issue: issue,
            issue_id: issue_id,
            sprint,
            is_selected: is_selected,
            is_highlighted: is_highlighted,
            is_loading: is_loading,
            is_saving: is_saving,
            is_collapsed: is_collapsed,
            is_expanded: !is_collapsed,
            is_fake,
            is_cursor_item,
            is_invalidated: is_invalidated || false,
            assignable_user_ids: assignable_user_ids,
            show_children: show_children,
            subject_prefix: subject_prefix || "",
            subject_suffix: subject_suffix || "",
            tag_category_names,
            header_list: header_list,
            isFeatureOfSelectedIssue,
            belongsToSelectedFeature,
            onDelete: onDelete || null,
            tagsByCategoryName,
            all_estimates_by_user_id,
            all_estimates,
            all_actuals_by_user_id,
            all_actuals,
            logged_in_user_id,
            logged_in_user_can_estimate_user_id
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(Issue)
