import React, {Component} from 'react'
import { concat, union, difference, includes } from 'lodash'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import { default_theme as theme } from '../theme/default'
import {connect} from 'react-redux'
import CommonTable from './CommonTable'
import OtherUser from './OtherUser'
import 'react-virtualized/styles.css'
import {
    ENTITY_KEY__DECISION_JOURNAL,
    HEADER_LIST_NAME__DECISION_JOURNAL
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    invalidateList,
    update_list_filter,
    getListFilter,
    getLoadingItemIds,
    getSelectedItems,
    getVisibleItemIds,
    getSelectedItemIds,
    getVisibleItems,
    getLastUpdated,
    isLoading
} from '../actions/ItemList'
import {
    invalidateAllDecisionJournals,
    fetchDecisionJournalsIfNeeded,
    cancelCandidateDecisionJournal,
    deleteDecisionJournals,
    ALL_AVAILABLE_DECISION_JOURNAL_HEADERS
} from '../actions/DecisionJournals'
import DivTableCell from './DivTableCell'
import Timestamp from './Timestamp'

class DecisionJournalList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onClickedDecisionJournal = this.onClickedDecisionJournal.bind(this)
        this.onDeleteDecisionJournal = this.onDeleteDecisionJournal.bind(this)
    }

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(initList(list_key))
            dispatch(update_list_filter(list_key, {project_id:project_id}))
            dispatch(fetchDecisionJournalsIfNeeded(list_key))
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, filter, onSelectDecisionJournals} = new_props
        if ( this.props.project_id !== new_props.project_id ) {
            onSelectDecisionJournals([])
            dispatch(update_list_filter(list_key, {project_id: new_props.project_id}))
        }
        if ( filter && filter.project_id ) {
            dispatch(fetchDecisionJournalsIfNeeded(list_key))
        }
    }

    onClickedDecisionJournal(event, decision_journal_id) {
        const {dispatch, onSelectDecisionJournals, selected_ids} = this.props
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

    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex, activeHeaders}) => {
        const { decision_journals } = this.props
        const key = `decision_journal_${columnIndex}_${rowIndex}`
        const header = activeHeaders[columnIndex]
        const header_key = header.key
        const item = decision_journals[rowIndex]
        if ( item.loaded === false ) {
            return (
                <DivTableCell key={key}>
                </DivTableCell>
            )
        }
        if ( item.type === "candidate" ) {
            return  (
                <DivTableCell key={key}
                              extra_style={css`background-color:${theme.colours.new_item_background}`}>
                  { header_key === "name" && "Creating journal entry..." }
                  { header_key !== "name" && <span>&nbsp;</span> }
                </DivTableCell>
            )
        }
        
        const decision_journal = item
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
            case "decision":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{decision_journal.decision}</div>
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
            case "decision_made_at":
                content = (
                    <DivTableCell key={header.key} >
                      <Timestamp value={decision_journal.decision_made_at} format='date' />
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

        const { all_headers, decision_journals, selected_ids, table_params } = this.props

        if ( decision_journals.length === 0 ) {
            return (
                <div className="div-table__row">
                  <div className="div-table__cell">No journal entries</div>
                </div>
            )
        }

        return (
            <CommonTable all_headers={all_headers}
                         header_list_name={HEADER_LIST_NAME__DECISION_JOURNAL}
                         onRowSelected={this.onClickedDecisionJournal}
                         onRowReordered={this.reorderDecisionJournal}
                         items={decision_journals}
                         selected_item_ids={selected_ids}
                         renderCell={this.renderCell}
                         table_params={table_params}
              />
        )
    }

    render() {
        if ( window.shortcuts_warning === undefined ) {
            console.log("The next warning about <shortcuts> will be fixed once react-shortcuts makes a new release. See https://github.com/avocode/react-shortcuts/pull/41")
            window.shortcuts_warning = true
        }
        return this.render_grid()
    }
}

const mapStateToProps = (state, props) => {
    
    const {list_key} = props

    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__DECISION_JOURNAL)
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const selected_items = getSelectedItems(state, list_key, ENTITY_KEY__DECISION_JOURNAL)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const filter = getListFilter(state, list_key)

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
        all_headers: ALL_AVAILABLE_DECISION_JOURNAL_HEADERS,
        filter
    }        

}

export default withRouter(connect(mapStateToProps)(DecisionJournalList))
