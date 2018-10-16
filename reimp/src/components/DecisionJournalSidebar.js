import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import Timestamp from './Timestamp'
import PropertyStack from './PropertyStack'
import PropertyStackComponent from './PropertyStackComponent'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureDecisionJournalsLoaded, getDecisionJournal, deleteDecisionJournals} from '../actions/DecisionJournals'
import EditableDecisionJournalDescription from './EditableDecisionJournalDescription'

class DecisionJournalSidebar extends Component {

    constructor(props) {
        super(props)
        this.state = {adding_visual_spec_doc: false}
    }
    
    componentDidMount() {
	const { dispatch, project_id, decision_journal_id } = this.props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( decision_journal_id ) {
	    dispatch(ensureDecisionJournalsLoaded([decision_journal_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { project_id, decision_journal_id } = new_props
	if ( project_id ) {
	    dispatch(ensureProjectsLoaded([project_id]))
	}
	if ( decision_journal_id ) {
	    dispatch(ensureDecisionJournalsLoaded([decision_journal_id]))
	}
    }

    onDeleteDecisionJournal = () => {
        const { dispatch, decision_journal_id } = this.props
        if (! window.confirm("Are you sure you want to delete this journal entry?") ) {
            return false
        }
        dispatch(deleteDecisionJournals([decision_journal_id]))
    }

    render() {

        const { decision_journal_id, decision_journal } = this.props

        if (! decision_journal_id ) {
            return null
        }
        
        return (
            <div className="sidebar decision_journal-sidebar">
              <PropertyStack>

                <PropertyStackComponent>
                  <div className="property--title">
                    <EditableDecisionJournalName decision_journal_id={decision_journal_id} />
                  </div>
                </PropertyStackComponent>
                <PropertyStackComponent>
                  <div className="property-text">
                    <EditableDecisionJournalDescription decision_journal_id={decision_journal_id} />
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div className="named-property">
                    <div className="named-property__name">Created</div>
                    <div className="named-property__value"><Timestamp format="short-date" value={moment(decision_journal.created)}/></div>
                  </div>
                </PropertyStackComponent>

                <PropertyStackComponent>
                  <div onClick={this.onDeleteDecisionJournal} className="icon--small-delete" />
                </PropertyStackComponent>
                
              </PropertyStack>
            </div>
        )
    }
}

export function mapStateToProps(state, props) {
    const { decision_journal_id, project_id } = props
    const project = getProject(state, project_id)
    const decision_journal = getDecisionJournal(state, decision_journal_id) || {}
    
    return {
        decision_journal_id,
        decision_journal,
        project_id,
        project,
        testables: decision_journal && decision_journal.testables
    }
}

export default connect(mapStateToProps)(DecisionJournalSidebar)

