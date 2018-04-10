import React, { Component } from 'react'
import { includes, keys } from 'lodash';
import { connect } from 'react-redux'
import classNames from 'classnames'
import {withRouter, Link} from 'react-router-dom'
import Timestamp from '../components/Timestamp'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType  from '../components/EditableSprintType'
import { getCellStyle } from '../actions/ItemListKeyRegistry'
import moment from 'moment'
import '../sass/sprint.css'

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
                header_list, visible_header_keys} = this.props

	if ( ! sprint ) {
	    return (
                <div className="div-table__row">
                  <div className="div-table__cell">
                    Loading...
                  </div>
                </div>
            )
	}

	if ( ! is_loading === false ) {
	    return (
		<div key={this.key+"."+sprint.id}
                     onClick={onClickedSprint}
                     className={classNames("div-table__row",
                                           {'div-table__row--selected':is_selected})}
		>
		  <div className="div-table__cell">{sprint && sprint.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
	} else {
            return (
		<div key={this.key+"."+sprint.id}
                onClick={onClickedSprint}
                className={classNames("div-table__row",
                                      'sprint',
                                      'sprint__type-'+sprint.sprint_type,
                                      {
                                          'div-table__row--drop-target': isOver,
                                          'sprint__is_clone': sprint.sprint_template_id,
                                          'div-table__row--selected': is_selected
                                      })}
		>
                  {includes(visible_header_keys, "number") &&
                   <div className="div-table__cell"
                        style={getCellStyle(header_list.number)}>
                     <div className="sprint__cell--number">
                       {sprint.number}
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "name") &&
                   <div className="div-table__cell"
                        style={getCellStyle(header_list.name)}>
                     <div className="sprint__cell--name">
                       {sprint.name}
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "start_time") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={getCellStyle(header_list.start_time)}>
                     <div className="sprint__cell--start-time">
                       <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "end_time") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={getCellStyle(header_list.end_time)}>
                     <div className="sprint__cell--end-time">
                       <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "num_issues") &&
                   <Link to={'/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues'}
                         className="div-table__cell sprint__cell__secondary"
                         onClick={this.onIssuesClick}
                         style={getCellStyle(header_list.num_issues)}>
                     <div className="sprint__cell--num-issues">
                       {sprint.num_issues || 0} Issues
                     </div>
                   </Link>
                  }
                  {includes(visible_header_keys, "status") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={getCellStyle(header_list.status)}>
                     <div className="sprint__cell--status">
                       <EditableSprintStatus class_name="sprint-cell__status" sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "type") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={getCellStyle(header_list.type)}>
                     <div className="sprint__cell--type">
                       <EditableSprintType class_name="sprint-cell__type" sprint_ids={[sprint.id]} />
                     </div>
                   </div>
                  }
                </div>
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
        header_list,
        visible_header_keys: keys(header_list),
    }
}

export default withRouter(connect(mapStateToProps)(Sprint))
