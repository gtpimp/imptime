import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import EditableProperty from './form/EditableProperty'
import SelectSprintForm from './form/SelectSprintForm'
import SprintLabel from './form/SprintLabel'
import Blank from './form/Blank'
import { moveIssuesToSprint } from '../actions/Issue'
import OtherUser from '../components/OtherUser'
import { getIssue } from '../actions/Issues'
import { getUser } from '../actions/Users'

class EditableIssueInSprint extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue } = this.props
        dispatch(moveIssuesToSprint([issue.id], new_value.sprint_id.value))
    }
    
    render() {
        const { issue, project_id } = this.props
        
        return (
            <div>
                <EditableProperty property_key='issue_sprint_id'
                                  initial_value={issue.sprint_id}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                >
                    <SelectSprintForm project_id={project_id} />
                    <SprintLabel />
                    <Blank />
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}
    const project_id = issue.project_id
    
    return {
        issue: issue,
        project_id: project_id
    }
}


export default connect(mapStateToProps)(EditableIssueInSprint)
