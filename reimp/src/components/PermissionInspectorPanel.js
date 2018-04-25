import React, {Component} from 'react'
import {connect} from 'react-redux'
import { has_permission } from '../actions/Users'
import ProjectName from './ProjectName'
import { isPermissionInspectorActive,
         stopPermissionInspector,
         getHighlightedObjectForPermissionInspector
} from '../actions/Auth'

class PermissionInspectorPanel extends Component {

    constructor(props) {
        super(props)
        this.onClose = this.onClose.bind(this)
    }

    onClose() {
        const { dispatch } = this.props
        dispatch(stopPermissionInspector())
    }

    renderPermission() {
        const { permission_name } = this.props
        return (
            <div className="permission-inspector-panel__permission">
              <div className="permission-inspector-panel__permission-name">
                {permission_name}
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
              <ProjectName project_id={project_id} />
              
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
    
    return {
        is_permission_inspector_active,
        project_id,
        permission_name,
        can_edit,
        can_view
    }
}

export default connect(mapStateToProps)(PermissionInspectorPanel)
