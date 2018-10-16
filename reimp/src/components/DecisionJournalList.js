import React, {Component} from 'react'
import { flatMap, keys, groupBy, filter, keyBy, size, uniq, concat, indexOf, map, union, difference, includes } from 'lodash'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { default_theme as theme } from '../theme/default'
import styled from 'react-emotion'
import Floater from "react-floater"
import {connect} from 'react-redux'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { logged_in_user } from '../actions/Auth'
import CommonTable from './CommonTable'
import 'react-virtualized/styles.css';
import {
    initList,
    invalidateList,
    update_list_filter,
    collapse_list,
    expand_list,
    setItemFlag,
    setCursorItem,
    getCursorItemId,
    getVisibleItemIds,
    getSelectedItemIds,
    getHighlightedItemIds,
    getItemFlag,
    getLastUpdated,
    isLoading,
    getListFilter
} from '../actions/ItemList'
import {
    invalidateAllDecisionJournals,
    fetchDecisionJournalsIfNeeded,
    cancelCandidateDecisionJournal,
    getCandidateDecisionJournal,
    ensureDecisionJournalsLoaded,
    getAllAvailableDecisionJournalHeaders,
    updateDecisionJournalMienHeaders,
    getDecisionJournalHeaderListForMien,
    deleteDecisionJournals
} from '../actions/DecisionJournals'
import { ensureTagsLoaded } from '../actions/Tags'
import DeleteDecisionJournal from './DeleteDecisionJournal'
import DivTableCell from './DivTableCell'
import Timestamp from './Timestamp'

class DecisionJournalList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onCollapse = this.onCollapse.bind(this)
        this.onExpand = this.onExpand.bind(this)
        this.onClickedDecisionJournal = this.onClickedDecisionJournal.bind(this)
        this.onDeleteDecisionJournal = this.onDeleteDecisionJournal.bind(this)
    }

    componentDidMount() {
        const {dispatch, selected_ids, list_key, project_id,
               decision_journal_ids, journals_by_id} = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(update_list_filter({project_id:project_id}))
            dispatch(fetchDecisionJournalsIfNeeded(list_key))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, selected_ids, decision_journals_by_id} = this.props
        const { decision_journal_ids, project_id } = new_props
        const {onSelectDecisionJournals} = this.props
        if ( this.props.project_id !== new_props.project_id ) {
            onSelectDecisionJournals([])
            dispatch(update_list_filter({project_id:new_props.project_id}))
        }
        dispatch(fetchDecisionJournalsIfNeeded(list_key))
    }

    onClickedDecisionJournal(event, decision_journal_id) {
        const {dispatch, onSelectDecisionJournals, selected_ids, project_id} = this.props
        if ( event ) {
            event.stopPropagation()
        }

        let selected_decision_journal_ids = []
        if (event.ctrlKey || event.metaKey) {
            if (includes(selected_ids, decision_journal_id)) {
                selected_decision_journal_ids = difference(selected_ids, [decision_journal_id])
            } else {
                selected_decision_journal_ids = union(selected_ids, [decision_journal_id])
            }
        } else if (event.shiftKey) {
            selected_decision_journal_ids = concat(selected_ids, [decision_journal_id])
        } else {
            selected_decision_journal_ids = [decision_journal_id]
        }
        if ( onSelectDecisionJournals ) {
            onSelectDecisionJournals(selected_decision_journal_ids)
        }
        dispatch(cancelCandidateDecisionJournal())
    }

    onRefresh(event) {
        const {dispatch, decision_journal_ids, list_key} = this.props
        dispatch(invalidateList(list_key))
        dispatch(invalidateAllDecisionJournals(decision_journal_ids))
        dispatch(cancelCandidateDecisionJournal())
        dispatch(fetchDecisionJournalsIfNeeded(list_key))
        if (event) {
            event.stopPropagation()
        }
    }

    onDeleteDecisionJournal = (event, decision_journal) => {
        const { dispatch, onDelete } = this.props
        event.stopPropagation()

        if ( ! window.confirm( "Delete this journal entry ?") ) {
            return
        }
        dispatch(deleteDecisionJournals([decision_journal.id]))
        if ( onDelete ) {
            onDelete(decision_journal.id)
        }
    }

    render_candidate_decision_journal() {

        const {list_key} = this.props

        return (
            <div key={list_key + ".candidate_decision_journal"}
                 className="div-table__row decision_journal_list__candidate_decision_journal">
              <div className="div-table__cell" colSpan="20">
                Creating new journal entry here
              </div>
            </div>
        )
    }

    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex}) => {
        const { sprint, decision_journal_items, header_list, logged_in_user_id, selected_items,
                tag_category_names, all_tags_by_id, logged_in_user_can_estimate_user_id } = this.props
        const key = `decision_journal_${columnIndex}_${rowIndex}`
        const that = this
        const header = header_list[columnIndex]
        const header_key = header.key
        const item = decision_journal_items[rowIndex]
        if ( item.type === "candidate" ) {
            return  (
                <DivTableCell key={key}
                              extra_style={css`background-color:${theme.colours.new_item_background}`}>
                  { header_key === "name" && "Creating journal entry..." }
                  { header_key !== "name" && <span>&nbsp;</span> }
                </DivTableCell>
            )
        }
        
        const decision_journal = item.decision_journal
        let content = null

        if ( isScrolling ) {
            const NON_SCROLLING_FIELDS = []
            if ( includes(NON_SCROLLING_FIELDS, header_key) ) {
                return (
                    <DivTableCell key={key}>
                      null
                    </DivTableCell>
                )
            }
        }
        
        switch(header_key) {
            case "description":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{decision_journal.description}</div>
                    </DivTableCell>
                )
                break
            case "decision_made_by":
                content = (
                    <DivTableCell key={header.key} >
                      <OtherUser user_id={decision_journal.decision_made_by_id}/>
                    </DivTableCell>
                )
                break
            default:
                console.error("Unknown header: " + header_key)
        }
        
        return (
            <div key={key}>
              {content}
            </div>
        )
    }

    render_grid() {

        const { is_mien_configurer_active, header_list, is_visible,
                decision_journal_items, selected_ids, table_params } = this.props

        if (!is_visible) {
            return (<div></div>)
        }

        if ( is_mien_configurer_active ) {
            return this.renderListColumnConfigurer()
        }

        if ( decision_journal_items.length === 0 ) {
            return (
                <div className="div-table__row">
                  <div className="div-table__cell">No journal entries</div>
                </div>
            )
        }

        return (
              <CommonTable getAvailableHeaders={getAllAvailableDecisionJournalHeaders}
                           getHeaderListForMien={getDecisionJournalHeaderListForMien}
                           onRowSelected={this.onClickedDecisionJournal}
                           onRowReordered={this.reorderDecisionJournal}
                           updateMienHeaders={updateDecisionJournalMienHeaders}
                           header_list_name="decision_journal"
                           items={decision_journal_items}
                           selected_item_ids={selected_ids}
                           header_list={header_list}
                           renderCell={this.renderCell}
                           table_params={table_params}
              />
        )
    }

    render() {
        const {is_visible} = this.props
        if (!is_visible) {
            return (<div></div>)
        }
        if ( window.shortcuts_warning === undefined ) {
            console.log("The next warning about <shortcuts> will be fixed once react-shortcuts makes a new release. See https://github.com/avocode/react-shortcuts/pull/41")
            window.shortcuts_warning = true
        }
        return this.render_grid()
    }
}

const makeMapStateToProps = () => {
    const mapStateToProps = (state, props) => {
        
        const {list_key, project_id, decision_journal_header_list} = props

        const visible_item_ids = getVisibleItemIds(state, list_key)
        const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__DECISION_JOURNAL)
        const selected_item_ids = getSelectedItemIds(state, list_key)
        const selected_items = getSelectedItems(state, list_key, ENTITY_KEY__DECISION_JOURNAL)
        const display_mode = getDisplayMode(state, list_key) || "expanded"
        const loading_item_ids = getLoadingItemIds(state, list_key)
        const is_loading = isLoading(state, list_key)
        const last_updated = getLastUpdated(state, list_key)
        const candidate_decision_journal = getCandidateDecisionJournal(state)
        const is_creating_decision_journal = candidate_decision_journal || false


        return {
            list_key: list_key,
            visible_item_ids,
            decision_journals: visible_items,
            decision_journal_ids: visible_item_ids,
            loading_item_ids,
            selected_ids: selected_item_ids,
            selected_items,
            has_items: visible_items && visible_items.length > 0,
            is_loading,
            last_updated,
            header_list
        }        

    }
    return mapStateToProps
}

export default withRouter(connect(makeMapStateToProps)(DecisionJournalList))
