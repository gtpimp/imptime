import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { getUser, ensureUsersLoaded } from '../actions/Users'
import { getProject, ensureProjectsLoaded } from '../actions/Projects'
import { getProjectUserPermission, ensureProjectUserPermissionsLoaded } from '../actions/ProjectUserPermissions'
import '../sass/user_permission.css'

class UserPermission extends Component {

    ensureProjectUserPermissionsLoaded

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        const {dispatch, assignable_user_ids, estimate_user_ids} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureProjectUserPermissionsLoaded(project_id, [user_id]))
    }
    
    render() {
        const { user, project, pup } = this.props

	if ( ! user.id || ! project.id || ! pup.id ) {
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
    const { project_id, user_id, onClose } = props
    const user = getUser(state, user_id) || {}
    const project = getProject(state, project_id) || {}
    const pup = getProjectUserPermission(state, project_id, user_id) || {}
    
    return {
        project: project,
        project_id: project_id,
	user: user,
	user_id: user_id,
        pup: pup,
        pup_id: pup.id
    }
}

export default connect(mapStateToProps)(UserPermission)
