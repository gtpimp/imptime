import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from '../form/EditableProperty'
import IssueDescriptionForm from '../form/IssueDescriptionForm'
import Label from '../form/Label'
import Blank from '../form/Blank'
import { updateIssueDescription } from '../actions/Issue'

class EditableIssueDescription extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        console.log(new_value)
        dispatch(updateIssueDescription(issue.id, new_value.description))
    }

    render() {
        const { issue } = this.props
        
        return (
            <EditableProperty property_key='issue_description'
                              initial_value={issue.description}
                              onChange={this.onChange}
            >
                <IssueDescriptionForm />
                <Label />
                <Blank />
            </EditableProperty>
        )
    }

}

function mapStateToProps(state, props) {
    const {issue} = props
    return {
        issue: issue
    }
}


export default connect(mapStateToProps)(EditableIssueDescription)
