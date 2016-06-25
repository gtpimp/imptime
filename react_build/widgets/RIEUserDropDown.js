import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import RIEDropDown from './RIEDropDown'
import OtherUser from '../components/OtherUser'
import Select from 'react-select';
import TextareaAutosize from 'react-autosize-textarea'
import { connect } from 'react-redux'
import {
    fetchUsersIfNeeded
} from '../actions/Users'	

export default class RIEUserDropDown extends RIEDropDown {

    constructor(props) {
	super(props)
	this.startEditing = this.startEditing.bind(this)
    }

    componentDidMount() {
	const { dispatch, user_ids } = this.props
	dispatch(fetchUsersIfNeeded(user_ids))
    }
    
    selectInputText(inputElem) {
    }

    startEditing(event) {
        this.setState({editing: true});
	event.stopPropagation()
    }
    
    renderNormalComponent() {
	const { value } = this.props
	return (
	    <OtherUser user_id={value}
		       render_mode="inline--small"
		       className={this.makeClassString()}
		       onClick={this.startEditing}
		       loading_value={ value } />
	)
    }
    
    renderEditingComponent() {
	const { options, value } = this.props

	return (
	    <div className="RIEDropDown">
		<Select name='dropdown'
			value={value}
			ref="input"
			autofocus={true}
			options={options}
			onChange={this.commit}
		/>
	    </div>
	)
    };

    render() {
        if(this.state.editing) {
            return this.renderEditingComponent();
        } else {
            return this.renderNormalComponent();
        }
    };
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
