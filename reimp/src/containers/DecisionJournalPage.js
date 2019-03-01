import React, {Component} from 'react'
import {connect} from 'react-redux'
import {includes, keys} from 'lodash'
import {withRouter} from 'react-router-dom'
import { has_permission } from '../actions/Users'
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
    getListFilter,
    getVisibleItemIds,
    areItemsReadyToDisplay
} from '../actions/ItemList'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    set_toolbars,
    setPageSelectedEntities,
    getPageSelectedEntities,
    setBrowserTitle,
    setGloballySelectedProjectId
} from '../actions/Page'
import {
    getCandidateDecisionJournal,
    isLoadingDecisionJournals,
    getDecisionJournalsById
} from '../actions/DecisionJournals'

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
             new_props.selected_decision_journal.id !== this.props.selected_decision_journal.id ) {
            
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
            dispatch(setPageSelectedEntities(page_key,
                                     {project_ids:[project.id]}))
            dispatch(invalidateList(list_key))
            dispatch(setDecisionJournalBreadcrumbsHelper(project, selected_decision_journal))
        }
        if ( default_decision_journal_id !== undefined && !includes(selected_decision_journal_ids, default_decision_journal_id) ) {
            dispatch(selectItems(LIST_KEY__DECISION_JOURNAL_LIST, [default_decision_journal_id]))
            dispatch(setPageSelectedEntities(page_key,
                                     {project_ids:[project.id],
                                      decision_journal_ids:[default_decision_journal_id]}))
        }
    }

    onSelectDecisionJournals(decision_journal_ids) {
        const {dispatch, history, project_id,
               list_key, page_key} = this.props
        dispatch(selectItems(list_key, decision_journal_ids))
        dispatch(setPageSelectedEntities(page_key,
                                 {project_ids: [project_id],
                                  decision_journal_ids: decision_journal_ids}))
        
        if ( decision_journal_ids && decision_journal_ids.length === 1 ) {
            history.push('/projects/'+project_id+'/journals/'+decision_journal_ids[0]);
        }
    }

    renderLeftPane() {

        const {project_id, list_key } = this.props

        return (
            <DecisionJournalList list_key={list_key}
                                 project_id={project_id}
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
        const {show_sidebar, project, can_view } = this.props
        setBrowserTitle(project.name)

        if (! can_view ) {
            return (
                <div>
                  No permission to view decision journals
                </div>
            )
        }
        
        return (
            <Splitter name="decision_journals_page">
              {this.renderLeftPane()}
              {(show_sidebar && this.renderRightPane()) || null}
            </Splitter>
        )
    }
}

function mapStateToProps(state, props) {
    const default_filter = props.default_filter || {}
    let list_key = props.list_key || LIST_KEY__DECISION_JOURNAL_LIST
    let page_key = props.page_key || PAGE_KEY__DECISION_JOURNALS_PAGE
    const filter = getListFilter(state, list_key)
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getDecisionJournalsById(state, visible_item_ids)
    const selected_decision_journal_ids = getPageSelectedEntities(state, page_key).decision_journal_ids
    
    const selected_items = items_by_id && selected_decision_journal_ids && selected_decision_journal_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const project_id = props.match.params.projectId
    const default_decision_journal_id = props.match.params.decisionJournalId
    const project = getProject(state, project_id) || {}
    const project_name = project.name
    const candidate_decision_journal = getCandidateDecisionJournal(state) || null
    const is_creating_decision_journal = candidate_decision_journal || false
    const selected_decision_journal = ( selected_items && selected_items.length > 0 && selected_items[0] ) || null
    const show_sidebar = (is_creating_decision_journal || (selected_decision_journal && selected_decision_journal.id)) || false
    const is_loading = !areItemsReadyToDisplay(state, list_key) || isLoadingDecisionJournals(state, keys(items_by_id))

    const can_view = has_permission(state, project_id, "has_view_decision_journal")

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
        show_sidebar,
        project_name,
        is_loading,
        can_view
    }
}

export default withRouter(connect(mapStateToProps)(DecisionJournalsPage))
