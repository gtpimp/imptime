import React, {Component} from 'react'
import {connect} from 'react-redux'
import Timestamp from './Timestamp'
import SidebarContainer from './SidebarContainer'
import SidebarSectionTitle from './SidebarSectionTitle'
import moment from 'moment'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureDecisionJournalsLoaded, getDecisionJournal, deleteDecisionJournals} from '../actions/DecisionJournals'
import EditableDecisionJournalDescription from './EditableDecisionJournalDescription'
import EditableDecisionJournalReason from './EditableDecisionJournalReason'
import EditableDecisionJournalContext from './EditableDecisionJournalContext'
import EditableDecisionJournalRepercussions from './EditableDecisionJournalRepercussions'

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
            <SidebarContainer>

              <div key="descriptionstack">
                <SidebarSectionTitle title="Description" />
                <EditableDecisionJournalDescription decision_journal_id={decision_journal_id} />
              </div>

              <div key="reasonstack">
                <SidebarSectionTitle title="Reason" />
                <EditableDecisionJournalReason decision_journal_id={decision_journal_id} />
              </div>

              <div key="contextstack">
                <SidebarSectionTitle title="Context" />
                <EditableDecisionJournalContext decision_journal_id={decision_journal_id} />
              </div>

              <div key="repercussionsstack">
                <SidebarSectionTitle title="Repercussions" />
                <EditableDecisionJournalRepercussions decision_journal_id={decision_journal_id} />
              </div>
              
              <div key="infostack">
                <SidebarSectionTitle title="Info" />
                <div className="named-property__name">Created</div>
                <div className="named-property__value"><Timestamp format="short-date" value={moment(decision_journal.created)}/></div>
                <div onClick={this.onDeleteDecisionJournal} className="icon--small-delete" />
              </div>
              
            </SidebarContainer>
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

