import React, {Component} from 'react'
import OtherUser from '../../components/OtherUser'
import Select from 'react-select';
import {connect} from 'react-redux'
import {ensureUsersLoaded, getUsers} from '../../actions/Users'
import '../../sass/single-value-selector.css'

export class SingleValueSelector extends Component {

    constructor(props) {
        super(props)
        this.onSelected = this.onSelected.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps() {
        this.refresh()
    }

    refresh() {
        const {dispatch, user_ids} = this.props
        dispatch(ensureUsersLoaded(user_ids))
    }

    onSelected(selected_option) {
        // const {onChange} = this.props
        // if (!selected_option) {
        //     return
        // }
        // onChange(selected_option.value)
    }

    render() {
        const {options, value} = this.props

        const suggestions = options.map((option, index) =>
            <div className="single-value-selector__suggestion" key={'suggestion_' + option.value}>
                <div className="single-value-selector__suggestion-number">
                    {(index + 1)}.
                </div>
                <div className="single-value-selector__suggestion-label">
                    {option.label}
                </div>
            </div>
        )
        return (
            <div className="single-value-selector">
                <div className="single-value-selector__input-wrapper">
                    <input className="single-value-selector__input"/>
                </div>
                <div className="single-value-selector__suggestions">
                    {suggestions}
                </div>
                {/*<Field name="assigned_to" component={this.renderSelectList}*/}
                       {/*valueField="value"*/}
                       {/*textField="label"*/}
                       {/*data={assignable_users}*/}
                {/*/>*/}
            </div>
        )
    }

}

function mapStateToProps(state, props) {

    // const {user_ids} = props
    // const {user} = state
    // const users = getUsers(state, user_ids)
    // const options = users.map((user) => ({
    //     value: user.id,
    //     label: user.username
    // }))

    return {
        // user_ids: user_ids,
        // users: user,
        options: [{ value: 1, label: 'John Smith'}, { value: 2, label: 'Maximillian Rentworthy'}, { value: 3, label: 'Isabella Longname du Testcase'}]
    }
}

export default connect(mapStateToProps)(SingleValueSelector)
