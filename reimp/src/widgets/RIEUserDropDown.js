import React from 'react'
import OtherUser from '../components/OtherUser'
import Select from 'react-select';
import { connect } from 'react-redux'
import {
    ensureUsersLoaded
} from '../actions/Users'
import RIEEditBase from './RIEEditBase';

export class RIEUserDropDown extends RIEEditBase {

    constructor(props) {
	super(props)
	this.onChange = this.onChange.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, user_ids } = this.props
	dispatch(ensureUsersLoaded(user_ids))
    }

    onChange(selected_option) {
        if ( ! selected_option ) {
            return
        }
	const new_value = selected_option.value
	this.props.onChange(new_value)
	this.props.onSave(new_value)
    }
    
    renderReadonly() {
	const { value } = this.props
	return (
	    <OtherUser value={value}
		       render_mode="inline--small"
		       loading_value={value} />
	)
    }
    
    renderEditing() {
	const { options, value } = this.props

	return (
	    <div className="RIEDropDown">
		<Select value={value}
			options={options}
			onChange={this.onChange}
		/>
	    </div>
	)
    };

    render() {
	const { is_editing, is_readonly } = this.props
	return (
	    <div>
		{ is_editing && this.renderEditing() }
		{ is_readonly && this.renderReadonly() }
	    </div>
	)
    }
}

function mapStateToProps(state, props) {

    const { user_ids } = props
    const { user } = state
    const users = (user && user.items_by_id && user_ids.map( (user_id) => user.items_by_id[user_id] || {'id':user_id, 'username':user_id})) || []
    const options = users.map(function(user) {
	return { value: user.id, label: user.username }
    })
    
    return {
	user_ids: user_ids,
	users: user,
	options: options
    }
}

export default connect(mapStateToProps)(RIEUserDropDown)
