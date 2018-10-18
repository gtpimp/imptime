import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureDecisionJournalsLoaded, getDecisionJournals} from '../actions/DecisionJournals'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'

class MultipleDecisionJournalSidebar extends Component {

    componentDidMount() {
        const {decision_journal_ids, dispatch} = this.props
        dispatch(ensureDecisionJournalsLoaded(decision_journal_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureDecisionJournalsLoaded(new_props.decision_journal_ids))
    }

    render() {

        const {decision_journals} = this.props

        return (

            <div className="sidebar decision_journal-sidebar">
              <PropertyStack>
                <PropertyStackComponent>
                  <div className="property-row">
                    <div className="property-value">
                      { decision_journals.length } decision journals selected
                    </div>
                  </div>
                  
                </PropertyStackComponent>
                
              </PropertyStack>
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {decision_journal_ids, project_id} = props
    const decision_journals = getDecisionJournals(state, decision_journal_ids) || []
    let decision_journal = null
    if ( decision_journals && decision_journals.length > 0 ) {
        decision_journal = decision_journals[0]
    }
    
    return {
        decision_journals: decision_journals || [],
        decision_journal,
        decision_journal_ids,
        project_id
    }
}

export default connect(mapStateToProps)(MultipleDecisionJournalSidebar)
