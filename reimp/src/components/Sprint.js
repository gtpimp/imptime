import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import classNames from 'classnames'
import {browserHistory} from 'react-router'
import { DndTypes } from '../actions/Dnd'
import Progress from '../components/Progress'
import Timestamp from '../components/Timestamp'
import moment from 'moment'
import '../sass/sprint.css'

class Sprint extends Component {

    constructor(props) {
        super(props)
        this.onIssuesClick = this.onIssuesClick.bind(this)
    }
    
    onIssuesClick() {
        const { sprint } = this.props
        browserHistory.push('/projects/'+sprint.project_id+'/sprints/'+sprint.id+'/issues');
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
		onClickedSprint, connectDragSource, connectDropTarget } = this.props

	if ( ! sprint ) {
	    return (<tr><td>Loading...</td></tr>)
	}

	if ( ! is_loading === false ) {
	    return (
		<tr key={this.key+"."+sprint.id}
		onClick={onClickedSprint}
		className={is_selected ? 'tr--selected' : ''}
		>
		<td>{sprint && sprint.id}</td>
		<td>Loading...</td>
		</tr>
	    )
	} else {
            return connectDragSource(connectDropTarget(
		<tr key={this.key+"."+sprint.id}
		onClick={onClickedSprint}
		className={classNames('sprint', 'sprint__type-'+sprint.sprint_type,
                                      {'tr--drop-target': isOver,
                                       'sprint__is_clone': sprint.sprint_template_id,
                                       'list-table__row--unselected': !is_selected,
                                       'list-table__row--selected': is_selected})}
		>
		<td className="list-table__cell">{sprint.number}</td>
		<td className="list-table__cell">{sprint.name}</td>
		<td className="list-table__cell">
                <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
                </td>
		<td className="list-table__cell">
                <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
                </td>
		<td className="list-table__cell sprint__num-issues-column" onClick={this.onIssuesClick}>{sprint.num_issues || 0} Issues
                </td>
		{ false && <td className="list-table__cell"><Progress issue={sprint} /></td> }
		<td className="list-table__cell">{sprint.status_name}</td>
		</tr>
            ))
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
    const { sprint_id, is_selected, is_collapsed, is_loading } = props
    const this_sprint = (sprint && sprint.items_by_id && sprint.items_by_id[sprint_id]) || {}

    return {
	      sprint: this_sprint,
	      sprint_id: sprint_id,
	      is_selected: is_selected,
	      is_loading: is_loading,
	      is_collapsed: is_collapsed,
	      is_expanded: !is_collapsed
    }
}

const headingSource = {
    beginDrag(props) {
	      return { id: props.sprint_id }
    }
};

const headingTarget = {
    drop: (props, monitor, component) => {
	      const { sprint_id } = props
	      const dragging_item = monitor.getItem()
	      if ( ! dragging_item ) {
	          return;
	      }
	      const dragging_sprint_id = dragging_item.id
	      if ( sprint_id === dragging_sprint_id ) {
	          console.log("ignoring dnd on the same element: " + sprint_id)
	          return;
	      }

	      props.reorderSprints(dragging_sprint_id, sprint_id)
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

export default connect(mapStateToProps) (DragSource(DndTypes.SPRINT, headingSource, collect) (DropTarget(DndTypes.SPRINT, headingTarget, collectDrop)(Sprint)))
