import React, { Component } from 'react'
import { keys, keyBy, map } from 'lodash';
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import Timestamp from '../components/Timestamp'
import Hours from './Hours'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType  from '../components/EditableSprintType'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import SprintStateSummary from './SprintStateSummary'
import moment from 'moment'
import DivTableRow from './DivTableRow'
import DivTableCell from './DivTableCell'
import DivTableLink from './DivTableLink'
import StatusCircle from './StatusCircle'

class Sprint extends Component {

    render_collapsed() {
	const { sprint } = this.props
	return (
	    <div key={this.key+".collapsed_sprint."+sprint.id}>
	      Sprint: {sprint.name}
	    </div>
	)
    }

    render() {
        const { sprint, sprint_id, is_loading, is_selected, onClickedSprint, header_list} = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        
	if ( ! sprint ) {
	    return (
                <DivTableRow>
                  <DivTableCell>
                    Loading...
                  </DivTableCell>
                </DivTableRow>
            )
	}

	if ( ! is_loading === false ) {
	    return (
		<DivTableRow key={this.key+"."+sprint.id}
                             onClick={onClickedSprint}
                             is_selected={is_selected}
		>
		  <DivTableCell>{sprint && sprint.id}</DivTableCell>
		  <DivTableCell>Loading...</DivTableCell>
		</DivTableRow>
	    )
	} else {
            return (
		<DivTableRow key={this.key+"."+sprint.id}
                             onClick={onClickedSprint}
                             is_selected={is_selected}
                             item_id={"sprint_"+sprint.id}
		>
                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "number":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      {sprint.number}
                                    </DivTableCell>
                                )
                            case "ref":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      {sprint.id}
                                    </DivTableCell>
                                )
                            case "name":
                                return (
                                    <DivTableCell key={header_key}
                                                  extra_style={getCellStyle(header)}>
                                      {sprint.name}
                                    </DivTableCell>
                                )
                            case "start_time":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
                                    </DivTableCell>
                                )
                            case "end_time":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra__style={getCellStyle(header)}>
                                      <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
                                    </DivTableCell>
                                )
                            case "num_issues":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <DivTableLink to={'/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues'}
                                                    extra_style={getCellStyle(header)}>
                                        {sprint.num_issues || 0} Issues
                                      </DivTableLink>
                                    </DivTableCell>
                                )
                            case "num_testable_issues":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <DivTableLink to={'/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues'}
                                                    key={header_key}
                                                    extra_style={getCellStyle(header)}>
                                        {sprint.num_testable_issues || 0} Issues
                                      </DivTableLink>
                                    </DivTableCell>
                                )
                            case "status":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <EditableSprintStatus class_name="sprint-cell__status" sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                                    </DivTableCell>
                                )
                            case "type":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <EditableSprintType class_name="sprint-cell__type" sprint_ids={[sprint.id]} />
                                    </DivTableCell>
                                )
                            case "hours_by_assignee":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      { sprint.hours_by_assignee && 
                                        <Hours hours={sprint.hours_by_assignee} />
                                      }
                                      { ! sprint.hours_by_assignee && "" }
                                    </DivTableCell>
                                )
                            case "estimates_by_assignee":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <Hours hours={sprint.estimated_hours_by_assignee} />
                                    </DivTableCell>
                                )
                            case "open_estimates_by_assignee":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <Hours hours={sprint.estimated_open_hours_by_assignee} />
                                    </DivTableCell>
                                )
                            case "has_dev_started":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      {(sprint.hours_by_assignee !== undefined && sprint.hours_by_assignee > 0) &&
                                       <StatusCircle colour="green"/>
                                      }
                                      {(sprint.hours_by_assignee !== undefined && sprint.hours_by_assignee <= 0) &&
                                       <StatusCircle colour="gray"/>
                                      }
                                    </DivTableCell>
                                )
                            case "state_summary":
                                return (
                                    <DivTableCell key={header_key}
                                                  secondary={true}
                                                  extra_style={getCellStyle(header)}>
                                      <SprintStateSummary sprint_id={sprint_id} auto_load={false} />
                                    </DivTableCell>
                                )

                            default:
                                console.error("Unknown header: " + header_key + " (headers are " + visible_header_keys + ")")
                                
                        }
                    }
                  )}
                </DivTableRow>
            )
	}
    }
}

function mapStateToProps(state, props) {
    const { sprint } = state
    const { sprint_id, is_selected, is_loading, header_list } = props
    const this_sprint = (sprint && sprint.items_by_id && sprint.items_by_id[sprint_id]) || {}

    return {
	sprint: this_sprint,
	sprint_id: sprint_id,
	is_selected: is_selected,
	is_loading: is_loading,
        header_list
    }
}

export default withRouter(connect(mapStateToProps)(Sprint))
