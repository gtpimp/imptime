import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/project.css'

class Project extends Component {

    render_collapsed() {
	const { project } = this.props
	return (
	    <div key={this.key+".collapsed_project."+project.id}>
		Project: {project.name}
	    </div>
	)
    }
    
    render_expanded() {
        const { project, is_loading, is_selected, isOver,
		onClickedProject, connectDragSource, connectDropTarget } = this.props

	if ( ! project ) {
	    return (<tr><td>Loading...</td></tr>)
	}
	
	if ( ! is_loading === false ) {
	    return (
		<tr key={this.key+"."+project.id}
		    onClick={onClickedProject}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td>{project && project.id}</td>
		    <td>Loading...</td>
		</tr>
	    )
	} else {
            return connectDragSource(connectDropTarget(
		<tr key={this.key+"."+project.id}
		    onClick={onClickedProject}
		    className={classNames('project', {'tr--selected': is_selected, 'tr--drop-target': isOver, 'list-table__row--unselected': !is_selected,
                'list-table__row--selected': is_selected})}
		    >
		    <td className="list-table__cell">{project.name}</td>
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
    const { project } = state
    const { project_id, is_selected, is_collapsed, is_loading } = props
    const this_project = (project && project.items_by_id && project.items_by_id[project_id]) || {}
    
    return {
	project: this_project,
	project_id: project_id,
	is_selected: is_selected,
	is_loading: is_loading,
	is_collapsed: is_collapsed,
	is_expanded: !is_collapsed
    }
}

const headingSource = {
    beginDrag(props) {
	return { id: props.project_id }
    }
};

const headingTarget = {
    drop: (props, monitor, component) => {
	const { project_id } = props
	const dragging_item = monitor.getItem()
	if ( ! dragging_item ) {
	    return;
	}
	const dragging_project_id = dragging_item.id
	if ( project_id === dragging_project_id ) {
	    console.log("ignoring dnd on the same element: " + project_id)
	    return;
	}
	
	props.reorderProjects(dragging_project_id, project_id)
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

export default connect(mapStateToProps) (DragSource(DndTypes.PROJECT, headingSource, collect) (DropTarget(DndTypes.PROJECT, headingTarget, collectDrop)(Project)))
    
