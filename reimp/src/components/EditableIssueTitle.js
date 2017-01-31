import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from '../form/EditableProperty'
import IssueTitleForm from '../form/IssueTitleForm'
import Label from '../form/Label'
import Blank from '../form/Blank'
import { updateIssueSubject } from '../actions/Issue'

class EditableIssueTitle extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        console.log(new_value)
        dispatch(updateIssueSubject(issue.id, new_value.title))
    }

    render() {
        const { issue } = this.props
        
        return (
            <EditableProperty property_key='issue_title'
                              initial_value={issue.subject}
                              onChange={this.onChange}
            >
                <IssueTitleForm />
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


export default connect(mapStateToProps)(EditableIssueTitle)
