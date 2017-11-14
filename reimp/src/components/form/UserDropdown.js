import React, {Component} from 'react'
import Select from 'react-select';
import { connect } from 'react-redux'
import {
    ensureUsersLoaded,
    getUsers
} from '../../actions/Users'

export class UserDropdown extends Component {

    constructor(props) {
	super(props)
	this.onSelected = this.onSelected.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
	const { dispatch, user_ids } = props
	dispatch(ensureUsersLoaded(user_ids))
    }

    onSelected(selected_option) {
        const { onChange } = this.props
        if ( ! selected_option ) {
            return
        }
	onChange(selected_option.value)
    }
    
    render() {
	const { options, value } = this.props

	return (
		<Select value={value}
			options={options}
			onChange={this.onSelected}
		/>
	)
    }
}

function mapStateToProps(state, props) {
    const { user_ids } = props
    const { user } = state
    const users = getUsers(state, user_ids) || []
    const options = users.map( (user) => ({ value: user.id, label: user.username }) )
    
    return {
	user_ids: user_ids,
	users: user,
	options: options
    }
}

export default connect(mapStateToProps)(UserDropdown)
