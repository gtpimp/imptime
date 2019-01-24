import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {
    createIssueTestable,
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated,
    promoteIssueTestableToIssue
} from '../actions/Issues'
import SidebarAddButton from './SidebarAddButton'
import { has_permission } from '../actions/Users'
import Testable from './Testable'

class IssueTestable extends Component {

    componentWillMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    onPromoteToIssue = (event) => {
        const { dispatch, issue_id, testable_id } = this.props
        event.stopPropagation()
        if ( ! window.confirm( "Convert this testable to a new issue?" ) ) {
            return
        }
        dispatch(promoteIssueTestableToIssue(issue_id, testable_id))
    }

    createTestable = (evt) => {
        const { dispatch, issue_id } = this.props
        evt.stopPropagation()
        dispatch(createIssueTestable(issue_id, null, null))
    }

    render() {
        const {testable, can_edit, project_id} = this.props

        const extra_actions = [ {label: "Promote to issue",
                                 onClick: this.onPromoteToIssue} ]
        
        return (
            <div>
              { testable.id && 
                <Testable testable={testable}
                          project_id={project_id}
                          can_edit={can_edit}
                          onDelete={this.onDelete}
                          extra_actions={extra_actions}
                />
              }
              { ! testable.id && 
                <div className="text-component--testable">
                  <SidebarAddButton label="Add testable"
                                    onButtonClick={this.createTestable} />
                </div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, testable_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_description')

    let testable = { id: null}
    if ( testable_id ) {
        map(issue.testables || [], function(issue_testable, index) {
            if ( issue_testable.id === testable_id ) {
                testable = issue_testable
            }
        })
    }

    return {
        issue_id: issue_id,
        issue,
        sprint_id: issue.sprint_id,
        testable_id: testable_id,
        testable: testable,
        project_id: issue.project_id,
        is_invalidated: is_issue_invalidated(state, issue.id),
        can_edit
    }
}


export default connect(mapStateToProps)(IssueTestable)
