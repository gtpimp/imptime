import React, { Component } from 'react'
import { connect } from 'react-redux'
import indexOf from 'lodash/indexOf'
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
	if ( user.loaded === false ) {
	    dispatch(ensureUsersLoaded([user_id]))
	}
    }
    
    render_inline_small() {
	const { user, loading_value, onClick } = this.props

	return (
	    <div key={this.key+".collapsed_user."+user.id}
		 onClick={onClick}
	    >
		{ user.username && user.username }
		{ ! user.username && loading_value }
	    </div>
	)
    }
    
    render() {
        const { user, render_mode, loading_value, onClick } = this.props

	if ( user.loaded === false ) {
	    return ( <div onClick={onClick}>{loading_value}</div> )
	}
	
	if ( render_mode === 'inline--small' ) {
	    return this.render_inline_small()
	} else {
	    return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { render_mode, loading_value } = props
    const user_id = props.user_id || props.value
    const user = getUser(state, user_id) || { 'loaded': false}
    
    return {
	user: user,
        user_id: user_id,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "..."
    }
}


export default connect(mapStateToProps)(OtherUser)
