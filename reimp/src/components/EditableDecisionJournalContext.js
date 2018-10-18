import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import DecisionJournalContextForm from './form/DecisionJournalContextForm'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { updateDecisionJournalContext, getDecisionJournal } from '../actions/DecisionJournals'
import { has_permission } from '../actions/Users'

class EditableDecisionJournalContext extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, decision_journal } = this.props
        dispatch(updateDecisionJournalContext(decision_journal.id, new_value.context))
    }

    render() {
        const { decision_journal, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={decision_journal.project_id}
                                            permission_description='has_edit_decision_journal'>
              <EditableProperty property_key={'decision_journal_context'+decision_journal.id}
                                initial_value={decision_journal.context}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                edit_as_modal={false}
                                actionLabel="Edit Decision Journal Context"
              >
                <DecisionJournalContextForm />
                <div className="text-component--readonly text-component--description">{decision_journal.context}</div>
                <div className="text-component--empty">Context</div>
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


export default connect(mapStateToProps)(EditableDecisionJournalContext)
