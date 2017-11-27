import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd';
import { includes, keys } from 'lodash';
import { connect } from 'react-redux'
import classNames from 'classnames'
import {browserHistory} from 'react-router'
import { DndTypes } from '../actions/Dnd'
import Progress from '../components/Progress'
import Timestamp from '../components/Timestamp'
import EditableSprintStatus from '../components/EditableSprintStatus'
import EditableSprintType  from '../components/EditableSprintType'
import moment from 'moment'
import '../sass/sprint.css'

class Sprint extends Component {

    constructor(props) {
        super(props)
        this.onIssuesClick = this.onIssuesClick.bind(this)
    }
    
    onIssuesClick(event) {
        const { sprint } = this.props
        event.stopPropagation()
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
		onClickedSprint, connectDragSource, connectDropTarget,
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
		<div className="div-table__row"
                     key={this.key+"."+sprint.id}
                     onClick={onClickedSprint}
                     className={classNames("div-table__row",
                                           {'div-table__row--selected':is_selected})}
		>
		  <div className="div-table__cell">{sprint && sprint.id}</div>
		  <div className="div-table__cell">Loading...</div>
		</div>
	    )
	} else {
            return connectDragSource(connectDropTarget(
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
                        style={{"minWidth":header_list.number.width,
                                "maxWidth":header_list.number.width}}>
                     <div className="sprint__cell--number">
                       {sprint.number}
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "name") &&
                   <div className="div-table__cell"
                        style={{"minWidth":header_list.name.width,
                                "maxWidth":header_list.name.width}} >
                     <div className="sprint__cell--name">
                       {sprint.name}
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "start_time") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={{"minWidth":header_list.start_time.width,
                                "maxWidth":header_list.start_time.width}}>
                     <div className="sprint__cell--start-time">
                       <Timestamp format="short-date" value={sprint.first_entry && moment(sprint.first_entry.start_time)}/>
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "end_time") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={{"minWidth":header_list.end_time.width,
                                "maxWidth":header_list.end_time.width}} >
                     <div className="sprint__cell--end-time">
                       <Timestamp format="short-date" value={sprint.last_entry && moment(sprint.last_entry.end_time)}/>
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "num_issues") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        onClick={this.onIssuesClick}
                        style={{"minWidth":header_list.num_issues.width,
                                "maxWidth":header_list.num_issues.width}} >
                     <div className="sprint__cell--num-issues">
                       {sprint.num_issues || 0} Issues
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "progress") &&
                   <div className="div-table__cell"
                        style={{"minWidth":header_list.progress.width,
                                "maxWidth":header_list.progress.width}} >
                     <div className="sprint__cell--progress">
                       <Progress issue={sprint} />
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "status") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={{"minWidth":header_list.status.width,
                                "maxWidth":header_list.status.width}} >
                     <div className="sprint__cell--status">
                       <EditableSprintStatus class_name="sprint-cell__status" sprint_ids={[sprint.id]} project_id={sprint.project_id} />
                     </div>
                   </div>
                  }
                  {includes(visible_header_keys, "type") &&
                   <div className="div-table__cell sprint__cell__secondary"
                        style={{"minWidth":header_list.type.width,
                                "maxWidth":header_list.type.width}} >
                     <div className="sprint__cell--type">
                       <EditableSprintType class_name="sprint-cell__type" sprint_ids={[sprint.id]} />
                     </div>
                   </div>
                  }
                </div>
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
