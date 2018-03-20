import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd';
import map from 'lodash/map'
import keys from 'lodash/keys'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import { getUser } from '../actions/Users'
import '../sass/user.css'

class User extends Component {

    render_narrow() {
	const { user } = this.props
	return (
	    <div key={this.key+".narrow_user."+user.id}>
		User: {user.name}
	    </div>
	)
    }
    
    render_wide() {
        const { user, is_loading, is_selected, isOver, invitation_pending,
		onClickedUser, connectDragSource, connectDropTarget, user_actions } = this.props

	if ( ! user ) {
	    return (<tr><td>Loading...</td></tr>)
	}
	
	if ( ! is_loading === false ) {
	    return (
		<tr key={this.key+"."+user.id}
		    onClick={onClickedUser}
		    className={is_selected ? 'tr--selected' : ''}
		>
		    <td>{user && user.id}</td>
		    <td>Loading...</td>
		</tr>
	    )
	} else {
            return connectDragSource(connectDropTarget(
		<tr key={this.key+"."+user.id}
		    onClick={onClickedUser}
		    className={classNames('user', {'tr--selected': is_selected,
                                                   'tr--drop-target': isOver,
                                                   'list-table__row--unselected': !is_selected,
                                                   'list-table__row--selected': is_selected})}
		    >
		    <td className="list-table__cell">{user.username}</td>
                    <td className="list-table__cell">{user.email}</td>
                    <td className="list-table__cell">{user.first_name}</td>
                    <td className="list-table__cell">{user.last_name}</td>
                    <td className="list-table__cell">
                        {invitation_pending && <div>Invite sent</div>}
                    </td>
                    <td className="list-table__cell">
                      <div className="user__actions">
                        { map(keys(user_actions), (user_action_name, index) => user_actions[user_action_name](user)) }
                      </div>
                    </td>
		</tr>
            ))
	}
    }

    render() {
        const { is_narrow, is_wide } = this.props

	if ( is_narrow ) {
	    return this.render_narrow()
	}
	else if ( is_wide ) {
	    return this.render_wide()
	} else {
	    return ( <div>Dev error</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { user_id, is_selected, is_narrow, is_loading, invitation_pending, user_actions } = props
    const user = getUser(state, user_id)
    
    return {
	user: user,
	user_id: user_id,
	is_selected: is_selected,
	is_loading: is_loading,
	is_narrow: is_narrow,
	is_wide: !is_narrow,
        invitation_pending: invitation_pending,
        user_actions: user_actions
    }
}

const headingSource = {
    beginDrag(props) {
	return { id: props.user_id }
    }
};

const headingTarget = {
    drop: (props, monitor, component) => {
	const { user_id } = props
	const dragging_item = monitor.getItem()
	if ( ! dragging_item ) {
	    return;
	}
	const dragging_user_id = dragging_item.id
	if ( user_id === dragging_user_id ) {
	    console.log("ignoring dnd on the same element: " + user_id)
	    return;
	}

        // Can't reorder users
	// props.reorderUsers(dragging_user_id, user_id)
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

export default connect(mapStateToProps) (DragSource(DndTypes.USER, headingSource, collect) (DropTarget(DndTypes.USER, headingTarget, collectDrop)(User)))
