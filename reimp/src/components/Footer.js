import React, {Component} from 'react'
import {connect} from 'react-redux'
import PermissionInspectorPanel from './PermissionInspectorPanel'
import { isPermissionInspectorActive } from '../actions/Auth'
import '../sass/footer.scss'
import { logged_in_user } from '../actions/Auth'
import { updateFooterHeight, getFooterHeight } from '../actions/Header'

class Footer extends Component {
    
    componentDidMount() {
        const { dispatch } = this.props
        const footerHeight = this.footerElem.clientHeight
        dispatch(updateFooterHeight(footerHeight))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, footer_height } = this.props
        const new_footer_height = this.footerElem.clientHeight
        if ( new_footer_height !== footer_height ) {
            dispatch(updateFooterHeight(new_footer_height))
        }
    }
    
    render() {
        const { is_permission_inspector_active } = this.props
        return (
            <div className="footer"
                 ref={(footer) => { this.footerElem = footer }}>
              { is_permission_inspector_active && <PermissionInspectorPanel/> }
            </div>
        )
    }
}

function mapStateToProps(state) {

    const user = logged_in_user()
    const has_usable_password = user['has_usable_password'] || false
    const is_permission_inspector_active = isPermissionInspectorActive(state)
    return {
        has_usable_password,
        footer_height: getFooterHeight(state),
        is_permission_inspector_active
    }
}

export default connect(mapStateToProps)(Footer)
