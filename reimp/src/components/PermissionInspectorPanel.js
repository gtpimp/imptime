import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map, includes } from 'lodash'
import classNames from 'classnames'
import { has_permission } from '../actions/Users'
import ProjectName from './ProjectName'
import OtherUser from './OtherUser'
import { isPermissionInspectorActive,
         stopPermissionInspector,
         getHighlightedObjectForPermissionInspector
} from '../actions/Auth'
import { ensureProjectUserPermissionsLoaded,
         getUserIdsWithPermission,
         convert_permission_name_to_label } from '../actions/ProjectUserPermissions'
import { getProject, ensureProjectsLoaded } from '../actions/Projects'
import { ensureUsersLoaded } from '../actions/Users'

class PermissionInspectorPanel extends Component {

    constructor(props) {
        super(props)
        this.onClose = this.onClose.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project_id, user_ids } = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
            dispatch(ensureProjectUserPermissionsLoaded(project_id))
        }
        if ( user_ids ) {
            dispatch(ensureUsersLoaded(user_ids))
        }
    }
    

    onClose() {
        const { dispatch } = this.props
        dispatch(stopPermissionInspector())
    }

    renderPermission() {
        const { permission_name, user_ids, user_ids_with_permission } = this.props
        const readable_permission_name = convert_permission_name_to_label(permission_name)
        return (
            <div className="permission-inspector-panel__permission">
              <div className="permission-inspector-panel__permission-name">
                Selected Permission: {readable_permission_name}
              </div>

              <div className="permission-inspector-panel__permission-users">
                { map(user_ids, function(user_id) {
                      const has_permission = includes(user_ids_with_permission, user_id)
                      return (
                          <div key={user_id}
                               className={classNames("permission-inspector-panel__permission-user",
                                         {"user-permission__permission_value--on":has_permission,
                                         "user-permission__permission_value--off":!has_permission})} >
                            <OtherUser user_id={user_id}/>
                          </div>
                      )}
                  )}
              </div>
            </div>
        )
    }
    
    render() {
        const { is_permission_inspector_active, project_id, permission_name, can_view } = this.props

        if ( ! is_permission_inspector_active ) {
            return null
        }
        
        return (
            <div className="permission-inspector-panel">

              <h2>
                Permission inspector
                <div className="permission-inspector-panel__close" onClick={this.onClose} >
                  <div className="icon--small-cross"/>
                </div>
              </h2>
              Project: <ProjectName project_id={project_id} />
              
              { !can_view &&
                <div>You cannot view permissions for this project</div>
              }
              
              { (!project_id || !permission_name) &&
                <div>Hover over an object to view its permissions</div>
              }

              { can_view && permission_name && this.renderPermission() }
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const permission_object = getHighlightedObjectForPermissionInspector(state) || {}
    const project_id = permission_object.project_id
    const permission_name = permission_object.permission_name
    const can_view = project_id && has_permission(state, project_id, 'has_view_permissions')
    const can_edit = project_id && has_permission(state, project_id, 'has_edit_permissions')
    const is_permission_inspector_active = isPermissionInspectorActive(state)
    let user_ids_with_permission = []
    if ( project_id && permission_name ) {
        user_ids_with_permission = getUserIdsWithPermission(state, project_id, permission_name)
    }
    const project = getProject(state, project_id)
    const user_ids = (project || {}).allowed_user_ids || []
    
    return {
        is_permission_inspector_active,
        project_id,
        permission_name,
        can_edit,
        can_view,
        user_ids,
        user_ids_with_permission
    }
}

export default connect(mapStateToProps)(PermissionInspectorPanel)
