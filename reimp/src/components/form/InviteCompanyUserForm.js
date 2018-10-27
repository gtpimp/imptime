import React, {Component} from 'react'
import {connect} from 'react-redux'
import difference from 'lodash/difference'
import {reduxForm, Field} from 'redux-form'
import {ensureUsersLoaded, getUsers, getLoggedInUser} from '../../actions/Users'
import {ensureCompaniesLoaded, getCompany} from '../../actions/Companies'
import SingleValueSelector from './SingleValueSelector'
//import SearchInput from '../SearchInput'
import '../../sass/invite-user-form.css'

class InviteCompanyUserForm extends Component {

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
        const {dispatch, invitable_user_ids, company_id} = this.props
        dispatch(ensureUsersLoaded(invitable_user_ids))
        dispatch(ensureCompaniesLoaded(company_id))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }

    renderSingleValueSelector(field) {
        const {input, data, ...rest} = field
        const { company_id } = this.props
        return (
            <SingleValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                rememberer_key={"user_"+company_id}
                placeholder="Search contacts or invite by email"
                {...rest}
            />
        )
    }

    render() {
        const {handleSubmit, invitable_user_options} = this.props
        return (
            <div className="invite-user-form">
                <form className="invite-user-form__form" onSubmit={handleSubmit}>
                    <div className="invite-user-form__filter">
                      {/* <SearchInput placeholder="Search contacts or invite by email" xtermRef={(ref) => this.filter_term_el = ref} onChange={this.onFilterTermChanged}/> */}
                        <Field name='invited_user_email'
                               component={this.renderSingleValueSelector}
                               valueField="value"
                               textField="label"
                               data={invitable_user_options}
                        />
                    </div>
                </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {company_id, onChange} = props

    const logged_in_user = getLoggedInUser(state)
    const company = getCompany(state, company_id) || {}

    const known_user_ids = logged_in_user.known_user_ids || []
    const invitable_user_ids = difference(known_user_ids, company.allowed_user_ids)

    const invitable_users = getUsers(state, invitable_user_ids)

    const invitable_user_options = invitable_users.map(function (user) {
        return {value: user.email, label: "" + user.visible_name + " (" + user.email + ") "}
    })


    return {
        enableReinitialize: true,
        onSubmit: onChange,
        invitable_user_options: invitable_user_options,
        invitable_user_ids: invitable_user_ids,
        company_id: company_id
    }
}

export default connect(mapStateToProps)(reduxForm({form: 'invite_user_form'})(InviteCompanyUserForm))
