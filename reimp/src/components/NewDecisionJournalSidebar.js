import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateDecisionJournal,
    updateCandidateDescription,
    saveCandidateDecisionJournal,
    cancelCandidateDecisionJournal
} from '../actions/DecisionJournals'
import DecisionJournalDescriptionForm from './form/DecisionJournalDescriptionForm'

class NewDecisionJournalSidebar extends Component {

    constructor(props) {
        super(props)
        this.onSaveCandidateDecisionJournal = this.onSaveCandidateDecisionJournal.bind(this)
        this.onCancelDecisionJournalCreation = this.onCancelDecisionJournalCreation.bind(this)
    }

    onSaveCandidateDecisionJournal(new_value) {
        const {dispatch} = this.props
        dispatch(updateCandidateDescription(new_value.description))
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
                    <DecisionJournalDescriptionForm
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
