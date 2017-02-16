import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { getUser } from '../actions/Users'
import '../sass/user.css'

class UserPermissions extends Component {

    render() {
        const { user, permissions } = this.props

	if ( ! user || ! permissions ) {
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
		    className={classNames('user', {'tr--selected': is_selected, 'tr--drop-target': isOver, 'list-table__row--unselected': !is_selected,
                'list-table__row--selected': is_selected})}
		    >
		    <td className="list-table__cell">{user.username}</td>
                    <td className="list-table__cell">{user.email}</td>
                    <td className="list-table__cell">{user.first_name}</td>
                    <td className="list-table__cell">{user.last_name}</td>
                    <td className="list-table__cell">
                        {invitation_pending && <div>Invite sent</div>}
                    </td>
		</tr>
            ))
	}
    }
}

function mapStateToProps(state, props) {
    const { user_id } = props
    const user = getUser(state, user_id) || {}
    
    return {
	user: user,
	user_id: user_id,
        permissions: user.permissions
    }
}

export default connect(mapStateToProps)(UserPermissions)
