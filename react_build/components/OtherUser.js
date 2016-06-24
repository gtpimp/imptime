import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import map from 'lodash/map'
import indexOf from 'lodash/indexOf'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import {
    fetchUsersIfNeeded
} from '../actions/Users'

export class OtherUser extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
	const { dispatch, user_id } = this.props
	if ( user_id ) {
	    dispatch(fetchUsersIfNeeded([user_id]))
	}
    }
    
    render_inline_small() {
	const { user, loading_value } = this.props

	return (
	    <div key={this.key+".collapsed_user."+user.id}>
		{ user.username && user.username }
		{ ! user.username && loading_value }
	    </div>
	)
    }
    
    render() {
        const { user_id, render_mode, loading_value } = this.props

	if ( ! user_id ) {
	    return ( <div>{loading_value}</div> )
	}
	
	if ( render_mode == 'inline--small' ) {
	    return this.render_inline_small()
	} else {
	    return ( <div>Dev error, unsupported render mode: {render_mode}</div> )
	}
    }
}

function mapStateToProps(state, props) {
    const { user } = state
    const { user_id, render_mode, loading_value } = props

    const this_user = (user && user.items_by_id && user.items_by_id[user_id]) || {}
    const is_loading = (user &&
			user.loading_item_ids &&
			indexOf(user.loading_item_ids, user_id) !== -1) || false
    
    return {
	user: this_user,
	is_loading: is_loading,
	render_mode: render_mode || "inline--small",
	loading_value: loading_value || "..."
    }
}


export default connect(mapStateToProps)(OtherUser)
