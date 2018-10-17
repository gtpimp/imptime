import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes} from 'lodash'
import {withRouter} from 'react-router-dom'
import DecisionJournalList from '../components/DecisionJournalList'
import DecisionJournalSidebar from '../components/DecisionJournalSidebar'
import NewDecisionJournalSidebar from '../components/NewDecisionJournalSidebar'
import MultipleDecisionJournalSidebar from '../components/MultipleDecisionJournalSidebar'
import Splitter from '../components/Splitter'
import {setDecisionJournalBreadcrumbsHelper} from '../actions/Breadcrumbs'
import {
    LIST_KEY__DECISION_JOURNAL_LIST,
    PAGE_KEY__DECISION_JOURNALS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    update_list_filter,
    invalidateList,
    getListFilter
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    select_decision_journals,
    select_projects,
    get_selected_decision_journal_ids,
    setBrowserTitle,
    setGloballySelectedProjectId
} from '../actions/Page'
import {getCandidateDecisionJournal, getDecisionJournalHeaderListForCurrentMien} from '../actions/DecisionJournals'

class DecisionJournalsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectDecisionJournals = this.onSelectDecisionJournals.bind(this)
    }

    componentDidMount() {
        const {dispatch, project_id, list_key, page_key} = this.props
        dispatch(set_toolbars(page_key, ['decision-journals']))
        const new_filter = { project_id: project_id }
        dispatch(update_list_filter(list_key, Object.assign({}, new_filter)))
        dispatch(setGloballySelectedProjectId(project_id))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {

        const { dispatch, list_key, default_filter } = new_props
        if ( new_props.project_id !== this.props.project_id ) {
            dispatch(update_list_filter(list_key, Object.assign({},
                                                                default_filter,
                                                                {project_id: new_props.project_id})))
            dispatch(setGloballySelectedProjectId(new_props.project_id))
        }
        
        if ( new_props.project !== this.props.project ||
             new_props.project_id !== this.props.project_id ||
             new_props.project.name !== this.props.project.name ||
             new_props.selected_decision_journal_id !== this.props.selected_decision_journal_id ||
             new_props.selected_decision_journal.id !== this.props.selected_decision_journal.id ||
             new_props.selected_decision_journal.loaded !== this.props.selected_decision_journal.loaded) {

            
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const {dispatch, project_id, list_key, page_key,
               default_decision_journal_id, project, 
               selected_decision_journal_ids, selected_decision_journal} = props
        if ( project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
        if (project && project.id) {
            dispatch(select_projects(page_key, [project.id]))
            dispatch(invalidateList(list_key))
            dispatch(setDecisionJournalBreadcrumbsHelper(project, selected_decision_journal))
        }
        if ( default_decision_journal_id !== undefined && !includes(selected_decision_journal_ids, default_decision_journal_id) ) {
            dispatch(selectItems(LIST_KEY__DECISION_JOURNAL_LIST, [default_decision_journal_id]))
            dispatch(select_decision_journals(page_key, [default_decision_journal_id]))
        }
    }

    onSelectDecisionJournals(decision_journal_ids) {
        const {dispatch, history, project_id,
               list_key, page_key} = this.props
        dispatch(selectItems(list_key, decision_journal_ids))
        dispatch(select_decision_journals(page_key, decision_journal_ids))
        
        if ( decision_journal_ids && decision_journal_ids.length === 1 ) {
            history.push('/projects/'+project_id+'/decision_journals/'+decision_journal_ids[0]);
        }
    }

    renderLeftPane() {

        const {project_id, list_key, decision_journal_header_list } = this.props
        
        return (
            <DecisionJournalList list_key={list_key}
                         project_id={project_id}
                         header_list={decision_journal_header_list}
                         onSelectDecisionJournals={this.onSelectDecisionJournals}
            />
        )
    }

    renderRightPane() {
        const { selected_decision_journal, project_id, is_multiple_selection,
                selected_decision_journal_ids, is_creating_decision_journal, is_single_selection } = this.props

        if ( is_creating_decision_journal ) {
            return (
                <div className="list-layout__sidebar">
                  <NewDecisionJournalSidebar />
                </div>
            )
        }
        
        if ( ! is_creating_decision_journal && is_single_selection && project_id && selected_decision_journal ) {
            return (
                <div className="list-layout__sidebar">
                  <DecisionJournalSidebar decision_journal_id={selected_decision_journal.id} project_id={project_id}/>
                </div>
            )
        }
        
        if ( ! is_creating_decision_journal && is_multiple_selection && project_id && selected_decision_journal_ids ) {
            return (
                <div className="list-layout__sidebar">
                  <MultipleDecisionJournalSidebar decision_journal_ids={selected_decision_journal_ids} project_id={project_id}/>
                </div>
            )
        }                              
    }

    render() {
        const {show_sidebar, project } = this.props
        setBrowserTitle(project.name)
        return (
            <Splitter name="decision_journals_page">
              {this.renderLeftPane()}
              {(show_sidebar && this.renderRightPane()) || null}
            </Splitter>
        )
    }
}

function mapStateToProps(state, props) {
    const {decision_journal} = state
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__DECISION_JOURNAL_LIST
    let page_key = props.page_key || PAGE_KEY__DECISION_JOURNALS_PAGE
    const filter = getListFilter(state, list_key)
    const items_by_id = (decision_journal && decision_journal.items_by_id) || {}
    const selected_decision_journal_ids = get_selected_decision_journal_ids(state, page_key)
    
    const selected_items = items_by_id && selected_decision_journal_ids && selected_decision_journal_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.match.params.projectId
    const default_decision_journal_id = props.match.params.decision_journalId
    const project = getProject(state, project_id) || {}
    const project_name = project.name
    const candidate_decision_journal = getCandidateDecisionJournal(state) || null
    const is_creating_decision_journal = candidate_decision_journal || false
    const decision_journal_header_list = getDecisionJournalHeaderListForCurrentMien(state)
    const selected_decision_journal = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_decision_journal || (selected_decision_journal && selected_decision_journal.id)) || false

    return {
        list_key,
        page_key,
        default_filter,
        filter,
        default_decision_journal_id,
        project_id: project_id,
        project: project || {},
        selected_decision_journals: selected_items,
        selected_decision_journal: selected_decision_journal || {},
        selected_decision_journal_ids: selected_decision_journal_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_decision_journal: is_creating_decision_journal,
        decision_journal_header_list,
        show_sidebar,
        project_name
    }
}

export default withRouter(connect(mapStateToProps)(DecisionJournalsPage))
