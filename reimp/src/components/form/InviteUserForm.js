import React, {Component} from 'react'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import SelectList from 'react-widgets/lib/SelectList'
import { ensureUsersLoaded, getUsers, getLoggedInUser } from '../../actions/Users'
import SingleValueSelector from './SingleValueSelector'

class InviteUserForm extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        const {dispatch, known_user_ids, project_id} = this.props
        dispatch(ensureUsersLoaded(known_user_ids))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }
    
    renderSingleValueSelector(field) {
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                {...rest}
            />
        )
    }

    render() {
        const {handleSubmit, known_user_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <Field name='assigned_user'
                       component={this.renderSingleValueSelector}
                       valueField="value"
                       textField="label"
                       data={known_user_options}
                />
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onChange } = props

    const logged_in_user = getLoggedInUser(state)
    
    const known_user_ids = logged_in_user.known_user_ids || []
    const users = getUsers(state, known_user_ids)

    const known_user_options = users.map(function (user) {
        return {value: user.id, label: user.username}
    })

    return {
        enableReinitialize: true,
        onSubmit: onChange,
        known_user_options: known_user_options,
        known_user_ids: known_user_ids,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form: 'invite_user_form'})(InviteUserForm))
