import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import {
    updateIssueTestable,
    createIssueTestable,
    deleteIssueTestable,
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated,
    promoteIssueTestableToIssue
} from '../actions/Issues'

import SidebarAddButton from './SidebarAddButton'
import TestableLineForm from './form/TestableLineForm'
import { has_permission } from '../actions/Users'
import TestableLine from './TestableLine'

class EditableIssueTestable extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    componentWillMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onChange(new_value) {
        const { dispatch, issue_id, testable_line_id } = this.props
        if ( testable_line_id ) {
            dispatch(updateIssueTestableLine(issue_id, testable_id, testable_line_id, new_value.testable_line))
        } else {
            dispatch(createIssueTestableLine(issue_id, testable_id, new_value.testable_line))
        }
    }

    onDelete(event) {
        const { dispatch, issue_id, testable_id, testable_line_id } = this.props
        event.stopPropagation()
        if (! window.confirm("Are you sure you want to delete this testable line?" ) ) {
            return false;
        }
        dispatch(deleteIssueTestableLine(issue_id, testable_id, testable_line_id))
    }

    render()
    {
        const {testable, testable_line, can_edit, issue_id, project_id} = this.props
        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_description'>
              { testable_line.id &&
                <EditableProperty property_key={'issue_testable_'+issue_id+'_'+testable.id}
                                  initial_value={testable}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <TestableLineForm form={'issue_testable_line_form_'+issue_id+'_'+testable.id+'_'+testable_line.id}
                                testable={testable}/>
                  <TestableLine testable_line={testable_line}
                                onDelete={this.onDelete}
                  />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              <div className="issue-testable__button-bar">
                { ! testable_line.id &&
                  <div className="issue-testable__button-bar__container">
                    <EditableProperty property_key={'issue_testable_'+issue_id}
                                      initial_value=''
                                      onChange={this.onChange}
                                      can_edit={can_edit}
                      >
                      <TestableLineForm form={'issue_testable_line_form_'+issue_id+'_'+testable.id} />
                      <div className="text-component--readonly"></div>
                      <div className="text-component--empty">
                        <div className="text-component--testable">
                          <SidebarAddButton label="Add testable line" />
                        </div>
                      </div>
                    </EditableProperty>
                  </div>
                }

              </div>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, testable_id, testable_line_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_description')

    let testable = { id: null}
    map(issue.testables || [], function(issue_testable, index) {
        if ( issue_testable.id === testable_id ) {
            testable = issue_testable
        }
    })

    let testable_line = { id: null }
    map(get(testable, ["lines"], []), function(issue_testable_line, index) {
        if ( issue_testable_line.id === testable_line_id ) {
            testable_line = issue_testable_line
        }
    })
    

    return {
        issue_id,
        issue,
        sprint_id: issue.sprint_id,
        testable_id,
        testable,
        testable_line,
        can_edit,
        project_id: issue.project_id,
        is_invalidated: is_issue_invalidated(state, issue.id),
    }
}


export default connect(mapStateToProps)(EditableIssueTestable)
