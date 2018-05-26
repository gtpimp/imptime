import React, { Component } from 'react'
import { keys, keyBy, map } from 'lodash';
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
                header_list} = this.props
        const headers_by_key = keyBy(header_list, "key")
        const visible_header_keys = keys(headers_by_key)
        const that = this

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

                  { map(visible_header_keys, function(header_key) {
                        const header = headers_by_key[header_key]
                        switch(header_key) {
                            case "number":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className="sprint__cell--number">
                                        {sprint.number}
                                      </div>
                                    </div>
                                )
                            case "name":
                                return (
                                    <div className="div-table__cell" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className="sprint__cell--name">
                                        {sprint.name}
                                      </div>
                                    </div>
                                )
                            case "start_time":
                                return (
                                    <div className="div-table__cell sprint__cell__secondary" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className="sprint__cell--start-time">
                                        <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
                                      </div>
                                    </div>
                                )
                            case "end_time":
                                return (
                                    <div className="div-table__cell sprint__cell__secondary" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className="sprint__cell--end-time">
                                        <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
                                      </div>
                                    </div>
                                )
                            case "num_issues":
                                return (
                                    <Link to={'/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues'}
                                          className="div-table__cell sprint__cell__secondary"
                                          onClick={that.onIssuesClick}
                                          key={header_key}
                                          style={getCellStyle(header)}>
                                      <div className="sprint__cell--num-issues">
                                        {sprint.num_issues || 0} Issues
                                      </div>
                                    </Link>
                                )
                            case "status":
                                return (
                                    <div className="div-table__cell sprint__cell__secondary" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className="sprint__cell--status">
                                        <EditableSprintStatus class_name="sprint-cell__status" sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                                      </div>
                                    </div>
                                )
                            case "type":
                                return (
                                    <div className="div-table__cell sprint__cell__secondary" key={header_key}
                                         style={getCellStyle(header)}>
                                      <div className="sprint__cell--type">
                                        <EditableSprintType class_name="sprint-cell__type" sprint_ids={[sprint.id]} />
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
