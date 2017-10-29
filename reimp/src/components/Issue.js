import React, {Component} from 'react'
import { keys, keyBy, map, includes, flatMap } from 'lodash'
import {DragSource, DropTarget} from 'react-dnd';
import {connect} from 'react-redux'
import classNames from 'classnames'
import { ENTITY_KEY__ISSUE } from '../actions/ItemListKeyRegistry'
import { getSelectedItems } from '../actions/ItemList'
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
import RIEDropDown from '../widgets/RIEDropDown'
import RIEModeToggler from '../widgets/RIEModeToggler'
import RIEUserDropDown from '../widgets/RIEUserDropDown'
import Progress from '../components/Progress'
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
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        const {dispatch, assignable_user_ids} = this.props
        dispatch(ensureUsersLoaded(assignable_user_ids))
    }

    onChangeAssignedTo(issue_id, new_value) {
        const {dispatch} = this.props
        dispatch(updateIssueAssignedTo(issue_id, new_value))
    }

    onChangeStatus(issue_id, new_value) {
        const {dispatch} = this.props
        dispatch(updateIssueStatus(issue_id, new_value))
    }

    onChangeFeature(issue_id, new_value) {
        const {dispatch} = this.props
        dispatch(updateIssueFeature(issue_id, new_value))
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

    onDeleteIssue() {
        const { issue, dispatch } = this.props
        console.log(issue.id)
        dispatch(deleteIssue(issue.id))
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
            issue, is_selected, onClickedIssue, assignable_user_ids,
            is_invalidated, is_saving,
            isOver, connectDragSource, connectDropTarget, show_children,
            subject_prefix, subject_suffix,
            issue_id, visible_header_keys,
            isFeatureOfSelectedIssue, belongsToSelectedFeature
        } = this.props

        const onDeleteTag = this.onDeleteTag

        if (!issue) {
            return (<tr>
              <td>Loading...</td>
            </tr>)
        }

        if (issue.loaded === false) {
            return (
                <tr key={this.key + "." + issue.id}
                    onClick={onClickedIssue}
                    className={classNames('issue', {'tr--selected': is_selected,
                                                    'tr--drop-target': isOver,
                                                    'issue--drop-target': isOver})}
                >
                  <td>
                    <div className="issue_list__issue_number_button">{issue.number}</div>
                  </td>
                  <td>Loading...</td>
                </tr>
            )
        } else {
            const isFeature = issue.can_group_issues
            const belongsToAFeature = issue.parent_group_id || false
            const isStandalone = !isFeature && !belongsToAFeature

            return connectDragSource(connectDropTarget(
                <tr key={this.key + "." + issue.id}
                    onClick={onClickedIssue}
                    className={classNames(
                            'issue', 'list-table__row--compact', {
                                'list-table__row--unselected': !is_selected,
                                'list-table__row--selected': is_selected,
                                'issue--standalone': isStandalone,
                                'issue--feature': isFeature,
                                'issue--grouped': belongsToAFeature,
                                'issue--feature-of-selected-issue': isFeatureOfSelectedIssue,
                                'issue--belongs-to-selected-feature': belongsToSelectedFeature,
                                /*'tr--selected': is_selected,*/
                                'tr--invalidated': is_invalidated,
                                'tr--saving': is_saving,
                                'tr--drop-target': isOver
                            })}
                >
                  {includes(visible_header_keys, "number") &&
                   <td className="list-table__cell list-table__cell--issue-number">
                     <div>{issue.number}</div>
                   </td>
                  }
                  {includes(visible_header_keys, "expand_feature") &&
                   <td className="list-table__cell list-table__cell--issue-icon">
                     { issue.can_group_issues &&
                       <div className="icon--feature">
                         { show_children &&
                           <div className="icon--more"></div>
                         }
                       </div>
                     }
                   </td>
                  }
                  {includes(visible_header_keys, "name") &&
                   <td className="list-table__cell list-table__cell--issue-name">
                     {subject_prefix}{issue.subject}{subject_suffix}
                     { issue.group_children.length > 0 &&
                       <span>
                         ({issue.group_children.length}
                         {issue.group_children.length === 1 && <span>child</span>}
                         {issue.group_children.length > 1 && <span>children</span>}
                         )
                       </span>
                     }
                   </td>
                  }
                  {includes(visible_header_keys, "assignee") &&
                   <td className="list-table__cell list-table__cell--issue-assignee">
                     <OtherUser user_id={issue.assigned_to_id}/>
                     { false &&
                       <RIEModeToggler
                           rie_key={"issue_assigned_to_" + issue.id}
                           initialValue={issue.assigned_to_id || "..."}
                           onChange={(new_value) =>
                               this.onChangeAssignedTo(issue.id, new_value)}>
                         <RIEUserDropDown user_ids={assignable_user_ids}/>
                       </RIEModeToggler>
                     }
                   </td>
                  }
                  {includes(visible_header_keys, "created_at") &&
                   <td className="list-table__cell list-table__cell--issue-created-at">
                     <Timestamp value={issue.created_at} format="from_now"/>
                   </td>
                  }
                   {includes(visible_header_keys, "status") &&
                    <td className="list-table__cell list-table__cell--issue-status">
                      <IssueStatusLabel value={issue.status_name}/>
                    </td>
                   }
                  { false &&
                    <td className="list-table__cell list-table__cell--issue-sprint">
                      1
                    </td>
                  }
                  {includes(visible_header_keys, "progress") &&
                   <td className="list-table__cell list-table__cell--issue-progress">
                     <Progress issue={issue}/>
                   </td>
                  }
                  {includes(visible_header_keys, "estimates") &&
                   <td className="list-table__cell list-table__cell--issue-estimates">
                     {this.renderEstimates()}
                   </td>
                  }
                  {includes(visible_header_keys, "tags") &&
                   <td className="list-table__cell list-table__cell--issue-tags">
                     { map(issue.tags, function (tag, index) {
                           return (<Tag key={index}
                                        category={tag.category_name}
                                        name={tag.name}
                                        deleteTag={() => onDeleteTag(tag)}
                           />)
                       })}
                   </td>
                  }
                  {includes(visible_header_keys, "my_time") &&
                   <td className="list-table__cell list-table__cell--issue-tracking-control">
                     <ElapsedTime hours={issue.my_actual_hours} active={issue.am_i_clocked_in}/>
                   </td>
                  }
                  {includes(visible_header_keys, "clock_in") &&
                   <td className="list-table__cell list-table__cell--issue-tracking-control">
                     <div className={classNames({'reveal-on-hover--block': !issue.am_i_clocked_in})}>
                       <TimerSwitch
                           active={issue.am_i_clocked_in}
                           onStart={this.onClockIn}
                           onStop={this.onClockOut}
                       />
                     </div>
                   </td>
                  }
                  {includes(visible_header_keys, "delete") &&
                   <td className="list-table__cell list-table__cell--issue-delete">
                     <div className={"reveal-on-hover--block"}>
                       <DeleteIssue
                           onDelete ={this.onDeleteIssue}
                       />
                     </div>
                   </td>
                  }
                </tr>
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
        issue_id, is_selected, is_collapsed,
        is_loading, is_invalidated, is_saving, show_children,
        subject_prefix, subject_suffix, issue_header_list, list_key
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

    const isFeatureOfSelectedIssue = includes(flatMap(selectedIssues, function(o) { return ["" + o.parent_group_id] }), "" + issue_id)
    const belongsToSelectedFeature = includes(flatMap(selectedIssues, function(o) { return map(o.group_children, function(id) { return "" + id }) }), "" + issue_id)

    return {
        issue: issue,
        issue_id: issue_id,
        is_selected: is_selected,
        is_loading: is_loading,
        is_saving: is_saving,
        is_collapsed: is_collapsed,
        is_expanded: !is_collapsed,
        is_invalidated: is_invalidated || false,
        assignable_user_ids: assignable_user_ids,
        show_children: show_children,
        subject_prefix: subject_prefix || "",
        subject_suffix: subject_suffix || "",
        visible_header_keys: keys(issue_header_list),
        isFeatureOfSelectedIssue,
        belongsToSelectedFeature
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
