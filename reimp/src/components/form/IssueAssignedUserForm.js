import React, {Component} from 'react'
import {connect} from 'react-redux'
import {reduxForm} from 'redux-form'
import IssueAssigneeField from './IssueAssigneeField'

class IssueAssignedUserForm extends Component {

    constructor(props) {
        super(props)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
    }

    onChangeAndSubmit(user_id) {
        const {handleSubmit} = this.props
        setTimeout(() => handleSubmit(), 0)
    }

    render() {
        const {handleSubmit, project_id } = this.props
        return (
            <form onSubmit={handleSubmit}>
              <IssueAssigneeField project_id={project_id} onChange={this.onChangeAndSubmit} />
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onSubmitted } = props

    return {
        initialValues: {assigned_to: props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form: 'issue_assigned_user_form'})(IssueAssignedUserForm))
