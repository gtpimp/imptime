import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateDecisionJournal,
    updateCandidateDecision,
    saveCandidateDecisionJournal,
    cancelCandidateDecisionJournal
} from '../actions/DecisionJournals'
import DecisionJournalDecisionForm from './form/DecisionJournalDecisionForm'

class NewDecisionJournalSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateDecisionJournal = this.onSaveCandidateDecisionJournal.bind(this)
        this.onCancelDecisionJournalCreation = this.onCancelDecisionJournalCreation.bind(this)
    }

    onSaveCandidateDecisionJournal(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateDecision(new_value.decision))
        dispatch(saveCandidateDecisionJournal())
    }

    onCancelDecisionJournalCreation() {
        const {dispatch} = this.props
        dispatch(cancelCandidateDecisionJournal())
    }
    
    render() {
        
        return (
            
            <Sidebar>
              <PropertyStack>
                <div>
                  <div>
                    <DecisionJournalDecisionForm
                        onSubmitted={this.onSaveCandidateDecisionJournal}
                        onCancel={this.onCancelDecisionJournalCreation}/>
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_decision_journal = getCandidateDecisionJournal(state) || null
    return {
        candidate_decision_journal: candidate_decision_journal
    }
}

export default connect(mapStateToProps)(NewDecisionJournalSidebar)
