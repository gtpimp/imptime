import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import EditableProperty from './form/EditableProperty'
import {
    updateIssueTestable,
    createIssueTestable,
    deleteIssueTestable,
    ensureIssuesLoaded,
    getIssue,
    is_issue_invalidated,
    promoteIssueTestableToIssue
} from '../actions/Issues'
import IssueTestableForm from './form/IssueTestableForm'
import Label from './form/Label'
import Blank from './form/Blank'
import { has_permission } from '../actions/Users'
import ReactMarkdown from 'react-markdown'

class EditableIssueTestable extends Component {

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
            dispatch(updateIssueTestable(issue_id, testable_id, new_value.testable))
        } else {
            dispatch(createIssueTestable(issue_id, new_value.testable))
        }
    }

    onDelete(new_value) {
        const { dispatch, issue_id, testable_id } = this.props
        dispatch(deleteIssueTestable(issue_id, testable_id))
    }

    onPromoteToIssue() {
        const { dispatch, issue_id, testable_id } = this.props
        if ( ! confirm( "Convert this testable to a new issue?" ) ) {
            return
        }
        dispatch(promoteIssueTestableToIssue(issue_id, testable_id))
    }

    render() {
        const {testable, can_edit, issue_id} = this.props
        return (

            <div>
              { testable.id &&
                <EditableProperty property_key={'issue_testable_'+issue_id+'_'+testable.id}
                                  initial_value={testable.steps}
                                  onChange={this.onChange}
                                  can_edit={can_edit}
                    >
                  <IssueTestableForm form={'issue_testable_form_'+issue_id+'_'+testable.id}
                                     issue_id={issue_id} testable={testable}/>
                  <div className="text-component--readonly text-component--testable">
                    <div className="issue_sidebar--textarea--readonly" >
                      <h1 className="issue-testable__testable-name">{testable.name}</h1>
                      <ReactMarkdown source={testable.steps} />
                    </div>
                  </div>
                  <div className="text-component--empty"></div>
                </EditableProperty>
              }

              <div className="issue-testable__button-bar">
                { ! testable.id &&
                  <div>
                    <EditableProperty property_key={'issue_testable_'+issue_id}
                                      initial_value=''
                                      onChange={this.onChange}
                                      can_edit={can_edit}
                      >
                      <IssueTestableForm form={'issue_testable_form_'+issue_id} issue_id={issue_id} />
                      <div className="text-component--readonly"></div>
                      <div className="text-component--empty">
                        <button className="button button--primary issue_sidebar--button">Create testable</button>
                      </div>
                    </EditableProperty>
                  </div>
                }

                { testable.id && <button className="button button--danger issue_sidebar--button" onClick={this.onDelete}>delete</button> }
                { testable.id && issue_id && <button className="button button--secondary issue_sidebar--button" onClick={this.onPromoteToIssue}>promote to issue</button> }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { issue_id, testable_id } = props
    const issue = getIssue(state, issue_id) || {}
    const can_edit = has_permission(state, issue.project_id, 'has_edit_subject')

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
        is_invalidated: is_issue_invalidated(state, issue.id),
    }
}


export default connect(mapStateToProps)(EditableIssueTestable)
