import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    ensureUsersLoaded, getUser
} from '../actions/Users'

class OtherUser extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const { dispatch, user_id, user } = this.props
        if ( user_id && user && user.loaded === false ) {
            dispatch(ensureUsersLoaded([user_id]))
        }
    }

    render() {
        const { user_id, user, render_mode, loading_value, onClick, display_mode } = this.props

        if ( ! user_id ) {
            return ( <div onClick={onClick}></div> )
        }

        const display_user = (user || { 'loaded': false, 'id': user_id }) || { 'username': 'no-one' }

        if ( display_user.loaded === false ) {
            return ( <div onClick={onClick}>{loading_value}</div> )
        }

        if ( render_mode === 'inline--small' ) {
            return (
                <div className="other_user"
                     key={this.key+".collapsed_user."+display_user.id}
                     onClick={onClick}
                >
                  { ! display_user.username && loading_value }
                  { display_mode==="username" && display_user.username && display_user.username }
                  { display_mode==="visible_name" && display_user.username && display_user.visible_name }
                </div>
            )
        } else {
            return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
        }
    }
}

function mapStateToProps(state, props) {
    const { render_mode, loading_value, display_mode } = props
    let { user_id, value } = props
    user_id = user_id || value
    const user = getUser(state, user_id)

    return {
        user,
        user_id,
        render_mode: render_mode || "inline--small",
        loading_value: loading_value || "...",
        display_mode: display_mode || "visible_name"
    }
}

export default connect(mapStateToProps)(OtherUser)
