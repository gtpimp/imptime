import React, {Component} from 'react'
import OtherUser from '../components/OtherUser'
import Select from 'react-select';
import { connect } from 'react-redux'
import {
    ensureUsersLoaded
} from '../actions/Users'
import RIEEditBase from './RIEEditBase';

export class UserDropdown extends Component {

    constructor(props) {
	super(props)
	this.onSelected = this.onSelected.bind(this)
    }
    
    componentDidMount() {
        refresh()
    }

    componentWillReceiveProps() {
        refresh()
    }

    refresh() {
	const { dispatch, user_ids } = this.props
	dispatch(ensureUsersLoaded(user_ids))
    }

    onSelected(selected_option) {
        const { onChange } = this.props
        if ( ! selected_option ) {
            return
        }
	onChange(selected_option.value)
    }
    
    /* renderReadonly() {
       const { value } = this.props
       return (
       <OtherUser user_id={value}
       render_mode="inline--small"
       loading_value={value} />
       )
     * }*/
    
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
    const users = getUsers(user_ids)
    const options = users.map( (user) => { value: user.id, label: user.username } )
    
    return {
	user_ids: user_ids,
	users: user,
	options: options
    }
}

export default connect(mapStateToProps)(UserDropdown)
