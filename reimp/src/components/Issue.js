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
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'


const DefaultListRowStyle = {display: 'flex',
                             flexDirection: 'row',
                             minHeight: '40px',
                             font: theme.fonts.list_items,              
                             paddingLeft: '18px',
                             backgroundColor: theme.colours.left_panel_background,
                             '&:hover': {
                                 backgroundColor: theme.colours.list_rollover
                             }
}

const TableCellStyle = {display: 'flex',
                        font: theme.fonts.list_items,
                        verticalAlign: 'middle',
                        alignItems: 'center',
                        color: theme.colours.normal_text,
}

const IssueRowDiv = styled('div')(props => Object.assign(DefaultListRowStyle,
                                            {backgroundColor: props.is_selected ? theme.colours.list_selected : theme.colours.left_panel_background,

                                             font: props.isFeature ? theme.fonts.feature_issue : theme.fonts.list_items,
                                             '&:hover': {
                                                 backgroundColor: props.is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover
                                             }
                                            }))

const TableCellDiv = styled('div')(props => Object.assign(TableCellStyle,
                                             {font: props.isFeature ? theme.fonts.feature_issue : theme.fonts.list_items}))

const TableCellSecondaryDiv = styled('div')(props => Object.assign(TableCellStyle,
                                                      {color: theme.colours.normal_text,
                                                       opacity: '0.6',

                                                       '&:hover': {
                                                           opacity: '1.0'
                                                       }
                                                      }))

const IconStyle = {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: '24px 24px',
    height: '24px',
    width: '24px',
}

const FeatureExpandIconUrl = require(`../images/ic_expand_more_black_24dp_1x.png`)
const FeatureExpandIconDiv = styled('div')(props => Object.assign(IconStyle,
                                                     {backgroundImage: `url(${FeatureExpandIconUrl})`}
))

const FeatureCollapseIconUrl = require(`../images/ic_chevron_right_black_24dp_1x.png`)
const FeatureCollapseIconDiv = styled('div')(props => Object.assign(IconStyle,
                                                       {backgroundImage: `url(${FeatureCollapseIconUrl})`}
))

const ChildIconUrl = require(`../images/ic_subdirectory_arrow_right_black_24dp_1x.png`)
const ChildIconDiv = styled('div')(props => Object.assign(IconStyle,
                                   {backgroundImage: `url(${ChildIconUrl})`,
                                    opacity: '0.2'},
                                   ({belongsToSelectedFeature=false}) => ({
                                       opacity: belongsToSelectedFeature ? '1.0' : '0.2'
                                   })
))


const AttachmentIconUrl = require(`../images/attachment.png`)
const AttachmentIconDiv = styled('div')(props => Object.assign(IconStyle,
                                        {backgroundImage: `url(${AttachmentIconUrl})`,
                                         backgroundSize: '15px 15px',
                                         height: '15px',
                                         width: '15px'}
))

class Issue extends Component {

    constructor(props) {
        super(props)
        this.onChangeStatus = this.onChangeStatus.bind(this)
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
            issue, is_selected,
            show_children,
            subject_prefix, subject_suffix,
            header_list,
            isFeatureOfSelectedIssue, belongsToSelectedFeature, tag_category_names,
            tagsByCategoryName, all_estimates_by_user_id,
            all_actuals_by_user_id, sprint, issue_id_as_list,
            logged_in_user_id, logged_in_user_can_estimate_user_id
        } = this.props

        const that = this
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)

        if (!issue) {
            return (
                <IssueRowDiv>
                  <TableCellDiv>Loading...</TableCellDiv>
                </IssueRowDiv>
            )
        }

        if (issue.loaded === false) {
            return (
                <IssueRowDiv key={this.key + "." + issue.id}
                             onClick={this.onClickedIssue}
                >
                  <TableCellDiv>
                    <div>{issue.number}</div>
                  </TableCellDiv>
                  <TableCellDiv>Loading...</TableCellDiv>
                </IssueRowDiv>
            )
        } else {
            const isFeature = issue.can_group_issues
            const belongsToAFeature = issue.parent_group_id || false

            return (
                <IssueRowDiv key={that.key + "." + issue.id}
                             onClick={that.onClickedIssue}
                             is_selected={is_selected}
                             isFeature={isFeature}
                             belongsToAFeature={belongsToAFeature}
                >

                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "number":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)}>
                                      <div>{issue.number}</div>
                                    </TableCellDiv>
                                )
                            case "issue_type":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)} >
                                      <div className={"issue-cell__issue-" + issue.type_name + "-icon"}></div>
                                    </TableCellDiv>
                                )
                            case "attachment":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)} >
                                      {
                                          issue.has_attachment && <AttachmentIconDiv></AttachmentIconDiv>
                                      }
                                    </TableCellDiv>
                                )
                            case "expand_feature":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)}>
                                      { issue.can_group_issues &&
                                        <div>
                                          { show_children &&
                                            <FeatureExpandIconDiv onClick={that.onCollapseFeaturesClick}
                                                                  isFeatureOfSelectedIssue={isFeatureOfSelectedIssue}>
                                            </FeatureExpandIconDiv>
                                          }
                                          { !show_children &&
                                            <FeatureCollapseIconDiv onClick={that.onExpandFeaturesClick}>
                                            </FeatureCollapseIconDiv>
                                          }
                                        </div>
                                      }
                                      { !issue.can_group_issues && issue.parent_group_id &&
                                        <ChildIconDiv belongsToSelectedFeature={belongsToSelectedFeature}></ChildIconDiv>
                                      }
                                    </TableCellDiv>
                                )
                            case "name":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)}
                                                  isFeature={isFeature}>
                                      <div>
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
                                    </TableCellDiv>
                                )
                            case "assignee":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <EditableIssueAssignedUser class_name="issue-cell__assignee" issue_ids={issue_id_as_list} project_id={issue.project_id}/>
                                    </TableCellSecondaryDiv>
                                )
                            case "created_at":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <Timestamp value={issue.created_at} format="from_now"/>
                                    </TableCellSecondaryDiv>
                                )
                            case "status":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <EditableIssueStatus class_name="issue-cell__status" issue_ids={issue_id_as_list} project_id={issue.project_id}/>
                                    </TableCellSecondaryDiv>
                                )
                            case "estimate_summary":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
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
                                    </TableCellSecondaryDiv>
                                )
                            case "tags":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <div className="issue-cell__tag">
                                        <TagListFlat issue_ids={issue_id_as_list} can_edit={false} />
                                      </div>
                                    </TableCellSecondaryDiv>
                                )
                            case "tag_columns":
                                return (
                                    map(tag_category_names, function(tag_category_name) {
                                        const tags = tagsByCategoryName[tag_category_name]
                                        return (
                                            <div key={tag_category_name}
                                                 className="div-table__cell issue__cell__secondary issue-cell__tag_column_container"
                                                 style={getCellStyle(header)}>
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
                                        <TableCellSecondaryDiv key={user_id}
                                                               style={getCellStyle(header)}>
                                          {logged_in_user_id === user_id &&
                                           <EditableIssueEstimate issue_id={issue.id}
                                                                  actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                                                  class_name="issue-cell__my-estimate"/> }

                                          {logged_in_user_id !== user_id &&
                                           <Progress issue={issue}
                                                     actual={(all_actuals_by_user_id[user_id] && all_actuals_by_user_id[user_id].hours) || null}
                                                     estimate={(all_estimates_by_user_id[user_id] && all_estimates_by_user_id[user_id].estimate_hours) || null} />
                                          }
                                        </TableCellSecondaryDiv>
                                    )
                                )
                            case "my_estimate":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      {logged_in_user_can_estimate_user_id &&
                                       <EditableIssueEstimate issue_id={issue.id}
                                                              class_name="issue-cell__my-estimate"/>
                                      }
                                    </TableCellSecondaryDiv>
                                )
                            case "estimated":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <EditableIssueEstimate class_name="issue-cell__my-estimate" issue_id={issue.id} />
                                    </TableCellSecondaryDiv>
                                )                                   
                            case "my_time":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <ElapsedTime hours={issue.my_actual_hours} active={issue.am_i_clocked_in}/>
                                    </TableCellSecondaryDiv>
                                )
                            case "clock_in":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <div className={classNames({'reveal-on-hover--block': !issue.am_i_clocked_in})}>
                                        <TimerSwitch
                                            active={issue.am_i_clocked_in}
                                            onStart={that.onClockIn}
                                            onStop={that.onClockOut}
                                        />
                                      </div>
                                    </TableCellSecondaryDiv>
                                )
                            case "delete":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <div className="reveal-on-hover--block issue__cell--issue-delete">
                                        <DeleteIssue
                                            onDelete={that.onDeleteIssue}
                                        />
                                      </div>
                                    </TableCellSecondaryDiv>
                                )
                            case "small_delete":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <div className={"reveal-on-hover--block"}>
                                        <div className="issue__small-delete-image" onClick={that.onDeleteIssue} />
                                      </div>
                                    </TableCellSecondaryDiv>
                                )

                            default:
                                console.error("Unknown header: " + header_key)
                        }
                    }
                  )}
                  
                </IssueRowDiv>
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
