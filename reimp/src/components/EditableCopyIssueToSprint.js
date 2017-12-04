import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import SelectSprintForm from './form/SelectSprintForm'
import SprintLabel from './form/SprintLabel'
import Blank from './form/Blank'
import { copyIssuesToSprint, getIssues } from '../actions/Issues'
import { has_permission } from '../actions/Users'

class EditableCopyIssueToSprint extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, issue_ids } = this.props
        dispatch(copyIssuesToSprint(issue_ids, new_value.sprint_id))
    }

    render() {
        const { sprint_id, project_id, can_edit } = this.props

        return (
            <div>
                <EditableProperty property_key={'issue_sprint_id'}
                                  initial_value={sprint_id}
                                  edit_as_modal={true}
                                  onChange={this.onChange}
                                  actionLabel="Copy to Sprint"
                                  can_edit={can_edit}
                >
                    <SelectSprintForm project_id={project_id} />
                    <button className="button button--secondary issue_sidebar--button">Copy to sprint</button>
                    <Blank/>
                </EditableProperty>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { issue_ids } = props

    const issues = getIssues(state, issue_ids) || []
    const issue = issues && issues.length > 0 && issues[0]
    const project_id = issue.project_id
    const sprint_id = issue.sprint_id
    const can_edit = has_permission(state, issue.project_id, 'has_add_issue')

    return {
        issue_ids,
        issues: issues,
        project_id: project_id,
        sprint_id: sprint_id,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableCopyIssueToSprint)
