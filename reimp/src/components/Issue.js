import React, {Component} from 'react'
import { keys, keyBy, map, includes, flatMap } from 'lodash'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { ENTITY_KEY__ISSUE, getCellStyle } from '../actions/ItemListKeyRegistry'
import { getSelectedItems, setItemFlag } from '../actions/ItemList'
import { setActivelyAvailableAutoClockEntity } from '../actions/AutoClock'
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
    makeSelIssueTagsByCategoryName,
    makeSelIssueAsList
} from '../selectors/IssueSelectors'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {getProject} from '../actions/Projects'
import { ensureUsersLoaded } from '../actions/Users'
import { ensureTagsLoaded } from '../actions/Tags'
import OtherUser from './OtherUser'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueEstimate from './EditableIssueEstimate'
import Progress from '../components/Progress'
import TimerSwitch from '../components/TimerSwitch'
import ElapsedTime from '../components/ElapsedTime'
import DeleteIssue from '../components/DeleteIssue'
import TagListFlat from '../components/TagListFlat'
import Timestamp from './Timestamp'
import { logged_in_user } from '../actions/Auth'

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

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, assignable_user_ids, issue, is_selected} = props
        dispatch(ensureUsersLoaded(assignable_user_ids))
        dispatch(ensureTagsLoaded(issue.tag_ids || []))
        dispatch(ensureSprintsLoaded([issue.sprint_id]))

        if ( issue.id && is_selected ) {
            dispatch(setActivelyAvailableAutoClockEntity(issue.project_id, issue.sprint_id, issue.id))
        }
        
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
            issue, is_selected, is_highlighted,
            is_invalidated, is_saving, is_fake,
            isOver, show_children,
            subject_prefix, subject_suffix,
            header_list,
            isFeatureOfSelectedIssue, belongsToSelectedFeature, is_cursor_item, tag_category_names,
            tagsByCategoryName, all_estimates_by_user_id,
            all_actuals_by_user_id, sprint, issue_id_as_list,
            logged_in_user_id, logged_in_user_can_estimate_user_id
        } = this.props

        const that = this
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
                <div key={that.key + "." + issue.id}
                     onClick={that.onClickedIssue}
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

                  { map(visible_header_keys, function(header_key) {
                        switch(header_key) {
                            case "number":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header_list.number)}>
                                      <div>{issue.number}</div>
                                    </div>
                                )
                            case "issue_type":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header_list.issue_type)} >
                                      <div className={"issue-cell__issue-" + issue.type_name + "-icon"}></div>
                                    </div>
                                )
                            case "attachment":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header_list.attachment)} >
                                      {
                                          issue.has_attachment && <div className="icon icon--attachment"></div>
                                      }
                                    </div>
                                )
                            case "expand_feature":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header_list.expand_feature)}>
                                      { issue.can_group_issues &&
                                        <div>
                                          { show_children &&
                                            <div className={classNames("icon--collapse",
                                                                       {"icon--collapse--highlight":isFeatureOfSelectedIssue})}
                                                 onClick={that.onCollapseFeaturesClick}></div>
                                          }
                                          { !show_children &&
                                            <div className="icon--expand" onClick={that.onExpandFeaturesClick}></div>
                                          }
                                        </div>
                                      }
                                      { !issue.can_group_issues && issue.parent_group_id &&
                                        <div className={classNames({"icon--child":true,
                                                                    "icon--child--highlight":belongsToSelectedFeature})}></div>
                                      }
                                    </div>
                                )
                            case "name":
                                return (
                                    <div className="div-table__cell" key={header_key}
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
                                )
                            case "assignee":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.assignee)}>
                                      <EditableIssueAssignedUser class_name="issue-cell__assignee" issue_ids={issue_id_as_list} project_id={issue.project_id}/>
                                    </div>
                                )
                            case "created_at":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.created_at)}>
                                      <div className="issue-cell__created-at">
                                        <Timestamp value={issue.created_at} format="from_now"/>
                                      </div>
                                    </div>
                                )
                            case "status":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.status)}>
                                      <EditableIssueStatus class_name="issue-cell__status" issue_ids={issue_id_as_list} project_id={issue.project_id}/>
                                    </div>
                                )
                            case "estimate_summary":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.estimate_summary)}>
                                      <div className="issue-cell__estimate_summary">
                                        {map(sprint.user_ids_who_can_estimate, function(user_id) {
                                             const actual = (all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null
                                             const estimate = (all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null
                                             if ( actual || estimate ) {
                                                 return (
                                                     <div className="issue-cell__estimate_summary__user" key={user_id}>
                                                       <div className="issue-cell__estimate_summary__user__cell">
                                                         <OtherUser user_id={user_id}/>
                                                       </div>
                                                       <div className="issue-cell__estimate_summary__user__cell">
                                                         {logged_in_user_id === user_id &&
                                                          <EditableIssueEstimate issue_id={issue.id}
                                                                                 actual={actual}
                                                                                 class_name="issue-cell__my-estimate"/>
                                                         }
                                                         {logged_in_user_id !== user_id &&
                                                          <Progress issue={issue} actual={actual} estimate={estimate} />
                                                         }
                                                       </div>
                                                     </div>
                                                 )
                                             }
                                         })}
                                      </div>
                                    </div>
                                )
                            case "tags":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.tags)}>
                                      <div className="issue-cell__tag">
                                        <TagListFlat issue_ids={issue_id_as_list} can_edit={false} />
                                      </div>
                                    </div>
                                )
                            case "tag_columns":
                                return (
                                    map(tag_category_names, function(tag_category_name) {
                                        const tags = tagsByCategoryName[tag_category_name]
                                        return (
                                            <div key={tag_category_name}
                                                 className="div-table__cell issue__cell__secondary issue-cell__tag_column_container"
                                                 style={getCellStyle(header_list.tag_columns)}>
                                              { map(tags, (tag) =>
                                                  <div key={tag.id} className="issue-cell__tag_column">
                                                    {tag.name}
                                                  </div>
                                              )}
                                            </div>
                                        )
                                    })

                                )
                            case "estimate_columns":
                                return (
                                    map(sprint.user_ids_who_can_estimate, (user_id) =>
                                        <div key={user_id}
                                             className="div-table__cell issue__cell__secondary"
                                             style={getCellStyle(header_list.estimate_columns)}>
                                          <div className="issue-cell__estimate_column">
                                            {logged_in_user_id === user_id &&
                                             <EditableIssueEstimate issue_id={issue.id}
                                                                    actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                                                    class_name="issue-cell__my-estimate"/> }

                                            {logged_in_user_id !== user_id &&
                                             <Progress issue={issue}
                                                       actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                                       estimate={(all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null} />
                                            }
                                          </div>
                                        </div>
                                    )
                                )
                            case "my_estimate":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.my_estimate)}>
                                      <div className="issue-cell__estimate_column">
                                        {logged_in_user_can_estimate_user_id &&
                                         <EditableIssueEstimate issue_id={issue.id}
                                                                class_name="issue-cell__my-estimate"/>
                                        }
                                      </div>
                                    </div>
                                )
                            case "estimated":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.estimated)}>
                                      <EditableIssueEstimate class_name="issue-cell__my-estimate" issue_id={issue.id} />
                                    </div>
                                )                                   
                            case "my_time":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.my_time)}>
                                      <div className="issue__cell--elapsed-time">
                                        <ElapsedTime hours={issue.my_actual_hours} active={issue.am_i_clocked_in}/>
                                      </div>
                                    </div>
                                )
                            case "clock_in":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.clock_in)}>
                                      <div className={classNames({'reveal-on-hover--block': !issue.am_i_clocked_in})}>
                                        <TimerSwitch
                                            active={issue.am_i_clocked_in}
                                            onStart={that.onClockIn}
                                            onStop={that.onClockOut}
                                        />
                                      </div>
                                    </div>
                                )
                            case "delete":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.delete)}>
                                      <div className="reveal-on-hover--block issue__cell--issue-delete">
                                        <DeleteIssue
                                            onDelete={that.onDeleteIssue}
                                        />
                                      </div>
                                    </div>
                                )
                            case "small_delete":
                                return (
                                    <div className="div-table__cell issue__cell__secondary" key={header_key}
                                         style={getCellStyle(header_list.small_delete)}>
                                      <div className={"reveal-on-hover--block"}>
                                        <div className="issue__small-delete-image" onClick={that.onDeleteIssue} />
                                      </div>
                                    </div>
                                )

                            default:
                                console.error("Unknown header: " + header_key)
                        }
                    }
                  )}
                  
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
    const selIssueAsList = makeSelIssueAsList()
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
            issue_id_as_list: selIssueAsList(state, props),
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
