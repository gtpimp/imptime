import React, { Component } from 'react'
import { keys, keyBy, map } from 'lodash';
import { connect } from 'react-redux'
import classNames from 'classnames'
import {withRouter, Link} from 'react-router-dom'
import Timestamp from '../components/Timestamp'
import Hours from './Hours'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType  from '../components/EditableSprintType'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import moment from 'moment'
import styled from 'react-emotion'
import { default_theme as theme } from '../theme/default'

const StatusCircle = {height: '16px',
                      width: '16px',
                      borderRadius: '8px',
                      opacity: '0.5'}


const DefaultListRowStyle = {display: 'flex',
                             flexDirection: 'row',
                             minHeight: '40px',
                             font: theme.fonts.list_items,              
                             paddingLeft: '18px',
                             backgroundColor: theme.colours.left_panel_background,
                             
                             ':hover': {
                                 backgroundColor: theme.colours.list_rollover
                             }
}

const TableCellStyle = {display: 'flex',
                        font: theme.fonts.list_items,
                        paddingLeft: '6px',
                        verticalAlign: 'middle',
                        alignItems: 'center',
                        color: theme.colours.normal_text,
}


const SprintRowDiv = styled('div')(props => (DefaultListRowStyle,
                                             {backgroundColor: props.is_selected ? theme.colours.list_selected : theme.colours.left_panel_background,
                                              ':hover': {
                                                  backgroundColor: props.is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover
                                              }}
)
)

const TableCellDiv = styled('div')(props => (TableCellStyle))
const SprintCellDiv = styled('div')(props => ({display: 'flex',
                                     verticalAlign: 'middle',
                                     alignItems: 'center',
                                     height: '100%',
                                     width: '100%',
}))
const TableCellSecondaryDiv = styled('div')(props => (TableCellStyle,
                                            {color: theme.colours.normal_text}))

const SprintStatusDiv = styled('div')(props => (StatusCircle,
                                                {backgroundColor: props.status_ok ? 'green' : 'lightgray'
                                      }))

const SprintLink = styled('Link')(props => ({display: 'flex',
                                             font: theme.fonts.list_items,
                                             paddingLeft: '6px',
                                             verticalAlign: 'middle',
                                             alignItems: 'center',
                                             color: theme.colours.list_text,

                                             ':hover': {
                                                 cursor: 'pointer',
                                                 textDecoration: 'underline'
                                             }
}))


class Sprint extends Component {

    constructor(props) {
        super(props)
        this.onIssuesClick = this.onIssuesClick.bind(this)
    }
    
    onIssuesClick(event) {
        const { history } = this.props
        event.stopPropagation()
        history.push();
    }

    render_collapsed() {
	      const { sprint } = this.props
	      return (
	          <div key={this.key+".collapsed_sprint."+sprint.id}>
		          Sprint: {sprint.name}
	          </div>
	      )
    }

    render_expanded() {
        const { sprint, is_loading, is_selected, isOver,
		            onClickedSprint,
                header_list} = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        const that = this

	      if ( ! sprint ) {
	          return (
                <SprintRowDiv>
                  <TableCellDiv>
                    Loading...
                  </TableCellDiv>
                </SprintRowDiv>
            )
	      }

	      if ( ! is_loading === false ) {
	          return (
		            <SprintRowDiv key={this.key+"."+sprint.id}
                              onClick={onClickedSprint}
                              is_selected={is_selected}
		            >
		              <TableCellDiv>{sprint && sprint.id}</TableCellDiv>
		              <TableCellDiv>Loading...</TableCellDiv>
		            </SprintRowDiv>
	          )
	      } else {
            return (
		            <SprintRowDiv key={this.key+"."+sprint.id}
                              onClick={onClickedSprint}
                              is_selected={is_selected}
		            >

                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "number":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.number}
                                      </SprintCellDiv>
                                    </TableCellDiv>
                                )
                            case "ref":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.id}
                                      </SprintCellDiv>
                                    </TableCellDiv>
                                )
                            case "name":
                                return (
                                    <TableCellDiv key={header_key}
                                                  style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.name}
                                      </SprintCellDiv>
                                    </TableCellDiv>
                                )
                            case "start_time":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "end_time":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_issues":
                                return (
                                    <SprintLink to={'/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues'}
                                                onClick={that.onIssuesClick}
                                                key={header_key}
                                                style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_issues || 0} Issues
                                      </SprintCellDiv>
                                    </SprintLink>
                                )
                            case "num_testable_issues":
                                return (
                                    <SprintLink to={'/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues'}
                                                onClick={that.onIssuesClick}
                                                key={header_key}
                                                style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_testable_issues || 0} Issues
                                      </SprintCellDiv>
                                    </SprintLink>
                                )
                            case "status":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        <EditableSprintStatus class_name="sprint-cell__status" sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "type":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        <EditableSprintType class_name="sprint-cell__type" sprint_ids={[sprint.id]} />
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_issues_unassigned":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_issues_unassigned}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "hours_by_assignee":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        { sprint.hours_by_assignee && 
                                          <Hours hours={sprint.hours_by_assignee} />
                                        }
                                        { ! sprint.hours_by_assignee && "" }
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "estimates_by_assignee":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        <Hours hours={sprint.estimated_hours_by_assignee} />
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "open_estimates_by_assignee":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        <Hours hours={sprint.estimated_open_hours_by_assignee} />
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_issues_with_estimates":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_issues_with_estimates || ""}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_issues_without_estimates":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues || 0) - (sprint.num_issues_with_estimates || 0)}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_open_issues_with_estimates":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_open_issues_with_estimates || ""}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_open_issues_without_estimates":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues || 0) - (sprint.num_open_issues_with_estimates || 0)}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_completely_closed_issues":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_completely_closed_issues || ""}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_not_completely_closed_issues":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues || 0) - (sprint.num_completely_closed_issues || 0)}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_dev_closed_issues":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {sprint.num_dev_closed_issues || ""}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "num_not_dev_closed_issues":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues || 0) - (sprint.num_dev_closed_issues || 0)}
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "are_all_issues_completely_closed":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues !== undefined &&
                                          ((sprint.num_testable_issues || 0) - (sprint.num_completely_closed_issues || 0) === 0)) &&
                                         <SprintStatusDiv status_ok={true}/>
                                        }
                                        {(sprint.num_testable_issues !== undefined &&
                                          ((sprint.num_testable_issues || 0) - (sprint.num_completely_closed_issues || 0) !== 0)) &&
                                         <SprintStatusDiv />
                                        }
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "are_all_issues_dev_closed":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues !== undefined &&
                                          ((sprint.num_testable_issues || 0) - (sprint.num_dev_closed_issues || 0) === 0)) &&
                                         <SprintStatusDiv status_ok={true}/>
                                        }
                                        {(sprint.num_testable_issues !== undefined &&
                                          ((sprint.num_testable_issues || 0) - (sprint.num_dev_closed_issues || 0) !== 0)) &&
                                         <SprintStatusDiv />
                                        }
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "are_all_issues_assigned":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_issues_unassigned !== undefined && sprint.num_issues_unassigned === 0) &&
                                         <SprintStatusDiv status_ok={true}/>
                                        }
                                        {(sprint.num_issues_unassigned !== undefined && sprint.num_issues_unassigned !== 0) &&
                                         <SprintStatusDiv />
                                        }
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "are_all_issues_estimated":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.num_testable_issues !== undefined &&
                                          ((sprint.num_testable_issues || 0) - (sprint.num_issues_with_estimates || 0) === 0)) &&
                                         <SprintStatusDiv status_ok={true}/>
                                        }
                                        {(sprint.num_testable_issues !== undefined &&
                                          ((sprint.num_testable_issues || 0) - (sprint.num_issues_with_estimates || 0) !== 0)) &&
                                         <SprintStatusDiv />
                                        }
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            case "has_dev_started":
                                return (
                                    <TableCellSecondaryDiv key={header_key}
                                                           style={getCellStyle(header)}>
                                      <SprintCellDiv>
                                        {(sprint.hours_by_assignee !== undefined && sprint.hours_by_assignee > 0) &&
                                         <SprintStatusDiv status_ok={true}/>
                                        }
                                        {(sprint.hours_by_assignee !== undefined && sprint.hours_by_assignee <= 0) &&
                                         <SprintStatusDiv />
                                        }
                                      </SprintCellDiv>
                                    </TableCellSecondaryDiv>
                                )
                            default:
                                console.error("Unknown header: " + header_key + " (headers are " + visible_header_keys + ")")
                                
                        }
                    }
                  )}
                </SprintRowDiv>
            )
	      }
    }

    render() {
        const { is_collapsed, is_expanded } = this.props

	      if ( is_collapsed ) {
	          return this.render_collapsed()
	      }
	      else if ( is_expanded ) {
	          return this.render_expanded()
	      } else {
	          return ( <div>Dev error</div> )
	      }
    }
}

function mapStateToProps(state, props) {
    const { sprint } = state
    const { sprint_id, is_selected, is_collapsed, is_loading, header_list } = props
    const this_sprint = (sprint && sprint.items_by_id && sprint.items_by_id[sprint_id]) || {}

    return {
	      sprint: this_sprint,
	      sprint_id: sprint_id,
	      is_selected: is_selected,
	      is_loading: is_loading,
	      is_collapsed: is_collapsed,
	      is_expanded: !is_collapsed,
        header_list
    }
}

export default withRouter(connect(mapStateToProps)(Sprint))
