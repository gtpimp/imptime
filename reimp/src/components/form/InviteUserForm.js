import React, {Component} from 'react'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import {ensureUsersLoaded, getUsers, getLoggedInUser} from '../../actions/Users'
import SingleValueSelector from './SingleValueSelector'
import SearchInput from '../SearchInput'
import '../../sass/invite-user-form.css'

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
        const {dispatch, known_user_ids} = this.props
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
        const {handleSubmit, known_user_options} = this.props
        return (
            <div className="invite-user-form">
                <form className="invite-user-form__form" onSubmit={handleSubmit}>
                    <div className="invite-user-form__filter">
                        <SearchInput placeholder="Search contacts" xtermRef={(ref) => this.filter_term_el = ref} xonChange={this.onFilterTermChanged}/>
                        {false &&
                        <Field name='invited_user_email'
                               component={this.renderSingleValueSelector}
                               valueField="value"
                               textField="label"
                               data={known_user_options}
                        />
                        }
                    </div>
                    <div className="invite-user-form__list-wrapper">
                        <div className="invite-user-form__list">
                            <div className="invite-user-form__list-item invite-user-form__list-item--selected">
                                <div className="invite-user-form__identity">
                                    <div className="invite-user-form__name">Mike Smith</div>
                                    <div className="invite-user-form__email">mike.smith@example.com</div>
                                </div>
                                <div className="invite-user-form__toggle invite-user-form__toggle--selected">
                                    <i className="material-icons">check_circle</i>
                                </div>
                            </div>
                            <div className="invite-user-form__list-item invite-user-form__list-item--unselected">
                                <div className="invite-user-form__identity">
                                    <div className="invite-user-form__name">Fran Jacobs</div>
                                    <div className="invite-user-form__email">fran.jacobs@example.com</div>
                                </div>
                                <div className="invite-user-form__toggle invite-user-form__toggle--unselected">
                                    <i className="material-icons">add_circle_outline</i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="invite-user-form__new-contact">
                        <div className="invite-user-form__new-contact-hint">Not listed above? Email an invite.</div>
                        <input type="email" placeholder="Email Address" name="username" ref={(el) => {
                            this.usernameInput = el
                        }}/>
                    </div>
                    <div className="invite-user-form__footer">
                        <button className="button button--large button--invite" gareth="if more than 1 person selected">Invite 3 People (or 1 Person)</button>
                        <button className="button button--large button--close-invite" gareth="otherwise this one">Close</button>
                    </div>
                </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const {project_id, onChange} = props

    const logged_in_user = getLoggedInUser(state)

    const known_user_ids = logged_in_user.known_user_ids || []
    const users = getUsers(state, known_user_ids)

    const known_user_options = users.map(function (user) {
        return {value: user.email, label: "" + user.username + " (" + user.email + ") "}
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
