import React, {Component} from 'react'
import { keys, keyBy, map, includes, flatMap } from 'lodash'
import {DragSource, DropTarget} from 'react-dnd';
import {connect} from 'react-redux'
import classNames from 'classnames'
import { ENTITY_KEY__ISSUE } from '../actions/ItemListKeyRegistry'
import { getSelectedItems, setItemFlag } from '../actions/ItemList'
import {
    updateIssueStatus,
    updateIssueFeature,
    updateIssueAssignedTo,
    deleteTag,
    getIssue,
    populateEstimates,
    clock,
    deleteIssue
} from '../actions/Issues'
import {getProject} from '../actions/Projects'
import {
    ensureUsersLoaded,
    getUser
} from '../actions/Users'
import OtherUser from '../components/OtherUser'
import EditableIssueAssignedUser from './EditableIssueAssignedUser'
import EditableIssueStatus from './EditableIssueStatus'
import EditableIssueEstimate from './EditableIssueEstimate'
import Progress from '../components/Progress'
import IssueEstimatesSummary from '../components/IssueEstimatesSummary'
import TimerSwitch from '../components/TimerSwitch'
import ElapsedTime from '../components/ElapsedTime'
import DeleteIssue from '../components/DeleteIssue'
import Tag from '../components/Tag'
import {DndTypes} from '../actions/Dnd'
import {format_hours} from '../actions/lib'
import IssueStatusLabel from '../components/form/IssueStatusLabel'
import Timestamp from './Timestamp'

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

    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, assignable_user_ids} = props
        dispatch(ensureUsersLoaded(assignable_user_ids))
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
        if ( ! confirm( "Delete this issue?") ) {
            return
        }
        dispatch(deleteIssue(issue.id))
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

    renderEstimates() {
        const {issue} = this.props
        return map(issue.all_estimates, function (estimate, index) {
            if (estimate.estimate_hours && estimate.estimate_user) {
                return (
                    <div key={estimate.estimate_user.id}>
                      {estimate.estimate_user.username}:{format_hours(estimate.estimate_hours)}
                    </div>
                )
            } else {
                return null
            }
        })
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

    render_expanded() {
        const {
            issue, is_selected, is_highlighted, onClickedIssue, assignable_user_ids,
            is_invalidated, is_saving, is_fake,
            isOver, connectDragSource, connectDropTarget, show_children,
            subject_prefix, subject_suffix,
            issue_id, visible_header_keys, header_list,
            isFeatureOfSelectedIssue, belongsToSelectedFeature, is_cursor_item
        } = this.props

        const onDeleteTag = this.onDeleteTag

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
                    onClick={onClickedIssue}
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

            return connectDragSource(connectDropTarget(
                <div key={this.key + "." + issue.id}
                     onClick={onClickedIssue}
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
                   <div className="div-table__cell div-table__cell--issue-number"
                        style={{width:header_list.number.width}}>
                     <div>{issue.number}</div>
                   </div>
                  }
                  {includes(visible_header_keys, "expand_feature") &&
                   <div className="div-table__cell div-table__cell div-table__cell--issue-icon"
                        style={{width:header_list.expand_feature.width}}>
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
                    <div className="div-table__cell div-table__cell div-table__cell--issue-name"
                         style={{width:header_list.name.width}}
                    >
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
                   }
                   {includes(visible_header_keys, "assignee") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-assignee  issue__cell__secondary"
                         style={{width:header_list.assignee.width}}
                    >
                      <EditableIssueAssignedUser class_name="issue-cell__assignee" issue_ids={[issue.id]} project_id={issue.project_id}/>
                    </div>
                   }
                   {includes(visible_header_keys, "created_at") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-created-at  issue__cell__secondary"
                         style={{width:header_list.created_at.width}}
                    >
                      <Timestamp value={issue.created_at} format="from_now"/>
                    </div>
                   }
                   {includes(visible_header_keys, "status") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-status  issue__cell__secondary"
                         style={{width:header_list.status.width}}
                    >
                      <EditableIssueStatus class_name="issue-cell__status" issue_ids={[issue.id]} project_id={issue.project_id}/>
                    </div>
                   }
                   {includes(visible_header_keys, "progress") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-progress  issue__cell__secondary"
                         style={{width:header_list.progress.width}}
                    >
                      <Progress issue={issue}/>
                    </div>
                   }
                   {includes(visible_header_keys, "estimated") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-estimates  issue__cell__secondary"
                         style={{width:header_list.estimated.width}}
                    >
                      <EditableIssueEstimate class_name="issue-cell__my-estimate" issue_id={issue.id} />
                    </div>
                   }
                   {includes(visible_header_keys, "tags") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-tags"
                         style={{width:header_list.tags.width}}
                    >
                      { map(issue.tags, function (tag, index) {
                            return (<Tag key={index}
                                         category={tag.category_name}
                                         name={tag.name}
                                         deleteTag={() => onDeleteTag(tag)}
                                    />)
                        })}
                    </div>
                   }
                   {includes(visible_header_keys, "my_time") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-tracking-control  issue__cell__secondary"
                         style={{width:header_list.my_time.width}}
                    >
                      <ElapsedTime hours={issue.my_actual_hours} active={issue.am_i_clocked_in}/>
                    </div>
                   }
                   {includes(visible_header_keys, "clock_in") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-tracking-control  issue__cell__secondary"
                         style={{width:header_list.clock_in.width}}
                    >
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
                    <div className="div-table__cell div-table__cell div-table__cell--issue-delete  issue__cell__secondary"
                         style={{width:header_list.delete.width}}
                    >
                      <div className={"reveal-on-hover--block"}>
                        <DeleteIssue
                            onDelete ={this.onDeleteIssue}
                        />
                      </div>
                    </div>
                   }
                   {includes(visible_header_keys, "small_delete") &&
                    <div className="div-table__cell div-table__cell div-table__cell--issue-small-delete  issue__cell__secondary"
                         style={{width:header_list.small_delete.width}}
                    >
                      <div className={"reveal-on-hover--block"}>
                        <div className="issue__small-delete-image" onClick={this.onDeleteIssue} />
                      </div>
                    </div>
                   }
                </div>
            ))
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

function mapStateToProps(state, props) {
    const {
        issue_id, is_selected, is_highlighted, is_collapsed,
        is_loading, is_invalidated, is_saving, show_children, is_fake,
        subject_prefix, subject_suffix, issue_header_list, list_key, is_cursor_item,
        onDelete
    } = props

    const issue = getIssue(state, issue_id) || {'loaded': false}
    const project_id = issue.project_id
    const project = getProject(state, project_id) || {}
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
    
    return {
        issue: issue,
        issue_id: issue_id,
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
        visible_header_keys: keys(issue_header_list),
        header_list: issue_header_list,
        isFeatureOfSelectedIssue,
        belongsToSelectedFeature,
        onDelete: onDelete || null
    }
}

const headingSource = {
    beginDrag(props) {
        return {id: props.issue_id}
    }
}

const headingTarget = {
    drop: (props, monitor, component) => {
        const {issue_id} = props
        const dragging_item = monitor.getItem()
        if (!dragging_item) {
            return;
        }
        const dragging_issue_id = dragging_item.id
        if (issue_id === dragging_issue_id) {
            console.log("ignoring dnd on the same element: " + issue_id)
            return;
        }

        props.reorderIssue(dragging_issue_id, issue_id)
    },
    hover: (props, monitor, component) => {
    },
    canDrop: (props, monitor) => {
        return true;
    }

}

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

export default connect(mapStateToProps)(DragSource(DndTypes.ISSUE, headingSource, collect)(DropTarget(DndTypes.ISSUE, headingTarget, collectDrop)(Issue)))
