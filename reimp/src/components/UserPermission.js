import React, { Component } from 'react'
import { connect } from 'react-redux'
import keys from 'lodash/keys'
import map from 'lodash/map'
import classNames from 'classnames'
import { getUser, ensureUsersLoaded } from '../actions/Users'
import { getProject, ensureProjectsLoaded } from '../actions/Projects'
import { getProjectUserPermission, ensureProjectUserPermissionsLoaded } from '../actions/ProjectUserPermissions'
import '../sass/user-permission.css'

class UserPermission extends Component {

    ensureProjectUserPermissionsLoaded

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props.project_id, new_props.user_id)
    }

    refresh(project_id, user_id) {
        const {dispatch} = this.props
        project_id = project_id || this.props.project_id
        user_id = user_id || this.props.user_id
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureUsersLoaded([user_id]))
        dispatch(ensureProjectUserPermissionsLoaded(project_id, [user_id]))
    }
    
    render() {
        const { user, project, pup, is_loading } = this.props

        return (
            <div className="user-permission">
                
	        { is_loading &&
                  <tr><td>Loading...</td></tr>
                }
                
                { !is_loading &&
                  map(keys(pup), (permission_name, index) =>
                      (
                          <div>
                              <div key={index}>{permission_name}</div>
                              <div>{pup[permission_name]}</div>
                          </div>
                      )
                  )
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, user_id, onClose } = props
    const user = getUser(state, user_id) || {}
    const project = getProject(state, project_id) || {}
    const pup = getProjectUserPermission(state, project_id, user_id) || {}

    const is_loading = ( ! user.id || ! project.id || ! pup.id )
    
    return {
        project: project,
        project_id: project_id,
	user: user,
	user_id: user_id,
        pup: pup,
        pup_id: pup.id,
        is_loading: is_loading
    }
}

export default connect(mapStateToProps)(UserPermission)
