import React, {Component} from 'react'
import {connect} from 'react-redux'
import { has_permission } from '../actions/Users'
import classNames from 'classnames'
import { isPermissionInspectorActive, getHighlightedObjectForPermissionInspector, highlightObjectForPermissionInspector } from '../actions/Auth'

class PermissionInspectorHighlighter extends Component {

    constructor(props) {
        super(props)
        this.state = { 'is_hovered': false }
        this.onHover = this.onHover.bind(this)
        this.onUnhover = this.onUnhover.bind(this)
        this.onSelect = this.onSelect.bind(this)
    }

    onHover() {
        this.setState({ is_hovered: true })
    }

    onUnhover() {
        this.setState({ is_hovered: false })
    }

    onSelect() {
        const { dispatch, project_id, permission_name } = this.props
        dispatch(highlightObjectForPermissionInspector(project_id, permission_name))
    }
    
    render() {
        const { is_permission_inspector_active, project_id, permission_name, can_view, active_project_id, active_permission_name } = this.props
        const { is_hovered } = this.state
        const is_active = active_project_id === project_id && active_permission_name === permission_name

        if ( ! is_permission_inspector_active || ! can_view || ! permission_name ) {
            return this.props.children
        }
        
        return (
            <div className={classNames("permission-inspector-highlighter",
                                       {"permission-inspector-highlighter--highlighted":is_hovered,
                                        "permission-inspector-highlighter--active":is_active})}
                 onMouseEnter={this.onHover}
                 onMouseLeave={this.onUnhover}>

              <div className="permission-inspector-highlighter__inspect icon--search--small"
                   onClick={this.onSelect} />
              {this.props.children}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id, permission_names } = props
    let { permission_name } = props
    if ( !permission_name && permission_names && permission_names.length > 0 ) {
        // support for multiple permission_names is limited at the moment
        permission_name = permission_names[0]
    }
    const can_view = project_id && has_permission(state, project_id, 'has_view_permissions')
    const is_permission_inspector_active = isPermissionInspectorActive(state)
    const active_permission_object = getHighlightedObjectForPermissionInspector(state) || {}
    const active_project_id = active_permission_object.project_id
    const active_permission_name = active_permission_object.permission_name
    
    return {
        is_permission_inspector_active,
        project_id,
        permission_name,
        can_view,
        active_project_id,
        active_permission_name
    }
}

export default connect(mapStateToProps)(PermissionInspectorHighlighter)
