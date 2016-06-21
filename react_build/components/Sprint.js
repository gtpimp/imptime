import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import map from 'lodash/map'

export class Sprint extends Component {

    constructor(props) {
        super(props)
    }
    
    render_collapsed() {
	const { sprint, list_key } = this.props
	return (
	    <div key={this.key+".collapsed_sprint."+sprint.id}>
		Sprint: {sprint.name}
	    </div>
	)
    }
    
    render_expanded() {
        const { sprint, is_loading, is_selected,
		onClickedSprint, connectDragSource } = this.props

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
	            { sprint.loaded === false &&
		      <td>Loading...</td>
		    }
		</tr>
	    )
	} else {
            return connectDragSource(
		<tr key={this.key+"."+sprint.id}
		    onClick={onClickedSprint}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td>{sprint.id}</td>
		    <td>{sprint.name}</td>
		    <td>{sprint.status_name}</td>
		</tr>
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
    const { sprint, item_list } = state
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

// see http://gaearon.github.io/react-dnd/docs-drop-target.html
const headingSource = {
    beginDrag() {
	//const { sprint_id } = this.props
	return {}
	//return { sprint_id: sprint_id };
    }
};

const headingTarget = {
    drop: (props, monitor, component) => {
	sprint = monitor.getItem()
	alert("Got the sprint: " + sprint.id)
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

function dndTarget(connect, monitor) {
    return {
	// Call this function inside render()
	// to let React DnD handle the drag events:
	connectDropTarget: connect.dropTarget(),
	// You can ask the monitor about the current drag state:
	isOver: monitor.isOver(),
	isOverCurrent: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
	itemType: monitor.getItemType()
    };
}

export default connect(mapStateToProps) (DragSource("sprint", headingSource, collect) (DropTarget("sprint", headingTarget, collectDrop)(Sprint)))
    
