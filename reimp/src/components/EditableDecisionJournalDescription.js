import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import DecisionJournalDecisionForm from './form/DecisionJournalDecisionForm'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { updateDecisionJournalDecision, getDecisionJournal } from '../actions/DecisionJournals'
import { has_permission } from '../actions/Users'

class EditableDecisionJournalDecision extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, decision_journal } = this.props
        dispatch(updateDecisionJournalDecision(decision_journal.id, new_value.decision))
    }

    render() {
        const { decision_journal, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={decision_journal.project_id}
                                            permission_description='has_edit_decision_journal'>
              <EditableProperty property_key={'decision_journal_decision'+decision_journal.id}
                                initial_value={decision_journal.decision}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                edit_as_modal={false}
                                actionLabel="Edit Decision Journal Decision"
              >
                <DecisionJournalDecisionForm />
                <div className="text-component--readonly text-component--description">{decision_journal.decision}</div>
                <div className="text-component--empty">Decision</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { decision_journal_id } = props
    const decision_journal = getDecisionJournal(state, decision_journal_id) || {}

    const can_edit = has_permission(state, decision_journal.project_id, 'has_edit_decision_journal')
    return {
        decision_journal: decision_journal,
        can_edit
    }
}


export default connect(mapStateToProps)(EditableDecisionJournalDecision)
