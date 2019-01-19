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
import TestableForm from './form/TestableForm'
import { has_permission } from '../actions/Users'
import Testable from './Testable'

class EditableIssueTestableName extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
        this.onPromoteToIssue = this.onPromoteToIssue.bind(this)
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
        const { dispatch, issue_id, testable_id } = this.props
        if ( testable_id ) {
            dispatch(updateIssueTestable(issue_id, testable_id, new_value.testable, new_value.name))
        } else {
            dispatch(createIssueTestable(issue_id, new_value.testable, new_value.name))
        }
    }

    onDelete(event) {
        const { dispatch, issue_id, testable_id } = this.props
        event.stopPropagation()
        if (! window.confirm("Are you sure you want to delete this testable?" ) ) {
            return false;
        }
        dispatch(deleteIssueTestable(issue_id, testable_id))
    }

    onPromoteToIssue(event) {
        const { dispatch, issue_id, testable_id } = this.props
        event.stopPropagation()
        if ( ! window.confirm( "Convert this testable to a new issue?" ) ) {
            return
        }
        dispatch(promoteIssueTestableToIssue(issue_id, testable_id))
    }

    render() {
        const {testable, can_edit, issue_id, project_id} = this.props
        return (

            <PermissionInspectorHighlighter project_id={project_id}
                                            permission_name='has_edit_description'>
              { testable.id &&
                <EditableProperty property_key={'issue_testable_'+issue_id+'_'+testable.id}
                                  initial_value={testable}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                >
                  <TestableForm form={'issue_testable_form_'+issue_id+'_'+testable.id}
                                testable={testable}/>
                  <Testable testable={testable}
                            onDelete={this.onDelete}
                            onPromoteToIssue={this.onPromoteToIssue}
                  />
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              <div className="issue-testable__button-bar">
                { ! testable.id &&
                  <div className="issue-testable__button-bar__container">
                    <EditableProperty property_key={'issue_testable_'+issue_id}
                                      initial_value=''
                                      onChange={this.onChange}
                                      can_edit={can_edit}
                      >
                      <TestableForm form={'issue_testable_form_'+issue_id} />
                      <div className="text-component--readonly"></div>
                      <div className="text-component--empty">
                        <div className="text-component--testable">
                          <SidebarAddButton label="Add testable" />
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

    const { issue_id, testable_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_description')

    let testable = { id: null}
    map(issue.testables || [], function(issue_testable, index) {
        if ( issue_testable.id === testable_id ) {
            testable = issue_testable
        }
    })

    return {
        issue_id: issue_id,
        issue,
        sprint_id: issue.sprint_id,
        testable_id: testable_id,
        testable: testable,
        can_edit: can_edit,
        project_id: issue.project_id,
        is_invalidated: is_issue_invalidated(state, issue.id),
    }
}


export default connect(mapStateToProps)(EditableIssueTestableName)
