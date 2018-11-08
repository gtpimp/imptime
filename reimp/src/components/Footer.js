import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorPanel from './PermissionInspectorPanel'
import { isPermissionInspectorActive } from '../actions/Auth'
import '../sass/footer.scss'
import { logged_in_user } from '../actions/Auth'

class Footer extends Component {
    
    render() {
        const { is_permission_inspector_active } = this.props
        return (
            <div className="footer" >
              { is_permission_inspector_active && <PermissionInspectorPanel/> }
              <div className="brand-footer">
                <div className="brand-footer__version">
                  ImpTime v2.5
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state) {

    const user = logged_in_user(state)
    const has_usable_password = user['has_usable_password'] || false
    const is_permission_inspector_active = isPermissionInspectorActive(state)
    return {
        has_usable_password,
        is_permission_inspector_active
    }
}

export default connect(mapStateToProps)(Footer)
