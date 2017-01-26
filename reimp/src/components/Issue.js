import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import map from 'lodash/map'
import {DragSource, DropTarget} from 'react-dnd';
import {connect} from 'react-redux'
import classNames from 'classnames'
import {
    updateIssueStatus,
    updateIssueFeature,
    updateIssueAssignedTo
} from '../actions/Issue'
import {
    fetchUsersIfNeeded
} from '../actions/Users'
import RIEDropDown from '../widgets/RIEDropDown'
import RIEInput from '../widgets/RIEInput'
import RIEModeToggler from '../widgets/RIEModeToggler'
import RIEUserDropDown from '../widgets/RIEUserDropDown'
import OtherUser from '../components/OtherUser'
import Progress from '../components/Progress'
import Timer from '../components/Timer'
import Tag from '../components/Tag'
import {DndTypes} from '../actions/Dnd'

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
    }

    componentDidMount() {
        const {dispatch, assignable_user_ids, project_id} = this.props
        dispatch(fetchUsersIfNeeded(assignable_user_ids))

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
            issue, is_loading, is_selected, onClickedIssue, assignable_user_ids,
            feature_options, is_invalidated, is_saving,
            isOver, connectDragSource, connectDropTarget, show_children,
            subject_prefix, subject_suffix
        } = this.props

        if (!issue) {
            return (<tr>
                <td>Loading...</td>
            </tr>)
        }

        if (issue.loaded === false) {
            return (
                <tr key={this.key + "." + issue.id}
                    onClick={onClickedIssue}
                    className={classNames('issue', {'tr--selected': is_selected, 'tr--drop-target': isOver})}
                >
                    <td>
                        <div className="issue_list__issue_number_button">{issue.number}</div>
                    </td>
                    <td>Loading...</td>
                </tr>
            )
        } else {
            const isFeature = issue.can_group_issues
            const belongsToFeature = issue.parent_group_id || false
            const isStandalone = !isFeature && !belongsToFeature
            return connectDragSource(connectDropTarget(
                <tr key={this.key + "." + issue.id}
                    onClick={onClickedIssue}
                    className={classNames(
                        'issue', {
                            'issue--unselected': !is_selected,
                            'issue--selected': is_selected,
                            'issue--standalone': isStandalone,
                            'issue--feature': isFeature,
                            'issue--grouped': belongsToFeature,
                        /*'tr--selected': is_selected,*/
                        'tr--invalidated': is_invalidated,
                        'tr--saving': is_saving,
                        'tr--drop-target': isOver
                    })}
                >
                    <td className="issue__cell issue__cell--number">
                        <div>{issue.number}</div>
                    </td>
                    <td className="issue__cell issue__cell--icon">
                        { issue.can_group_issues &&
                          <div className="icon--feature">
                          { show_children &&
                            <div className="icon--more"></div>
                          }
                          </div>
                        }
                        
                    </td>
                    <td className="issue__cell issue__cell--name">
                        {subject_prefix}{issue.subject}{subject_suffix}
                        { issue.group_children.length > 0 &&
                          <span>
                            ({issue.group_children.length}
                                { issue.group_children.length == 1 && <span>child</span> }
                                { issue.group_children.length > 1 && <span>children</span> }
                            )
                          </span>
                        }
                    </td>
                    <td className="issue__cell issue__cell--assignee">
                        <RIEModeToggler
                            rie_key={"issue_assigned_to_" + issue.id}
                            initialValue={issue.assigned_to_id || "..."}
                            onChange={(new_value) => this.onChangeAssignedTo(issue.id, new_value)}
                        >
                            <RIEUserDropDown user_ids={assignable_user_ids}/>
                        </RIEModeToggler>
                    </td>
                    <td className="issue__cell issue__cell--status">
                        <RIEModeToggler
                            rie_key={"issue_status_" + issue.id}
                            initialValue={issue.status || "..."}
                            onChange={(new_value) => this.onChangeStatus(issue.id, new_value)}
                        >
                            <RIEDropDown options={ISSUE_STATUS_CHOICES}/>
                        </RIEModeToggler>
                    </td><td className="issue__cell issue__cell--feature">
                        <RIEModeToggler
                            rie_key={"issue_feature_" + issue.id}
                            initialValue={issue.feature_name || "..."}
                            onChange={(new_value) => this.onChangeFeature(issue.id, new_value)}
                        >
                            <RIEDropDown options={feature_options}/>
                        </RIEModeToggler>
                    </td>
                    { false &&
                      <td className="issue__cell issue__cell--sprint">
                          1
                      </td>
                    }
                    <td className="issue__cell issue__cell--progress">
                        <Progress issue={issue} />
                    </td>
                    { false && <td className="issue__cell issue__cell--estimates">
                        (3) 4:00
                    </td>
                    }
                    <td className="issue__cell issue__cell--tags">
                        { map(issue.tags, function(tag, index) {
                              return (<Tag key={index} category={tag.category_name} name={tag.name}/>)
                        })}
                    </td>
                    <td className="issue__cell issue__cell--tracking-control">
                        <Timer />
                    </td>
                </tr>
            ))
        }
    }

    render() {
        const {is_collapsed, is_expanded} = this.props

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
    const {project, issue, item_list, user} = state
    const {
        issue_id, is_selected, is_collapsed,
        is_loading, is_invalidated, is_saving, show_children,
        subject_prefix, subject_suffix
    } = props

    const this_issue = (issue && issue.items_by_id && issue.items_by_id[issue_id]) || {'loaded': false}
    const project_id = this_issue.project_id
    const this_project = (project && project.items_by_id && project.items_by_id[project_id]) || {}
    const assignable_user_ids = this_project.allowed_user_ids || []
    const feature_names = this_project.feature_names || []
    const feature_options = feature_names.map(
        function (feature_name) {
            return {'value': feature_name, 'label': feature_name}
        }
    )

    return {
        issue: this_issue,
        issue_id: issue_id,
        is_selected: is_selected,
        is_loading: is_loading,
        is_saving: is_saving,
        is_collapsed: is_collapsed,
        is_expanded: !is_collapsed,
        is_invalidated: is_invalidated || false,
        assignable_user_ids: assignable_user_ids,
        feature_options: feature_options,
        show_children: show_children,
        subject_prefix: subject_suffix || "",
        subject_suffix: subject_suffix || ""
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
        if (issue_id == dragging_issue_id) {
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
