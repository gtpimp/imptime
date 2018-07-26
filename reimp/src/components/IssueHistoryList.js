import React, { Component } from 'react'
import map from 'lodash/map'
import { connect } from 'react-redux'
import {
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    getListFilter,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
} from '../actions/ItemList'
import {
    invalidateAllIssueHistories,
    fetchIssueHistoriesIfNeeded
} from '../actions/IssueHistories'
import { ensureIssuesLoaded } from '../actions/Issues'
import Pagination from './Pagination'
import IssueHistory from './IssueHistory'
import DivTable from './DivTable'
import { ENTITY_KEY__ISSUE_HISTORY } from '../actions/ItemListKeyRegistry'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

class IssueHistoryList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key, issue_id } = props
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
        }
        dispatch(fetchIssueHistoriesIfNeeded(list_key))
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(fetchIssueHistoriesIfNeeded(list_key))
    }

    onRefresh(event) {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllIssueHistories())
	dispatch(fetchIssueHistoriesIfNeeded(list_key))
	if ( event ) {
	    event.stopPropagation()
	}
    }

    renderHeader() {
        const { header_list } = this.props
        return (
            <div className="div-table__header_row">
              { map(header_list, (v, k) => (
                    <div key={k}
                         className="div-table__header_cell"
                         style={getCellStyle(v)}>
                      {v.label }
                    </div>
                ))}
            </div>
        )
    }
    
    renderExpandedIssueHistory(issue_history, index) {
        const { list_key, loading_item_ids, header_list } = this.props

        const is_loading = loading_item_ids.indexOf(issue_history.id) !== -1 || issue_history.loaded === false
        
        return (
            <IssueHistory key={list_key + "_" + issue_history.id + "_" + issue_history.name + "_" + index}
                     is_collapsed={false}
                     is_loading={is_loading}
                     header_list={header_list}
                     issue_history_id={issue_history.id}
            />
        )
    }

    render() {
        const { list_key, issue_histories } = this.props
	return (
	    <div>
              <DivTable renderHeader={this.renderHeader}>
                {issue_histories.map((issue_history, index) => this.renderExpandedIssueHistory(issue_history, index))}
              </DivTable>
              <Pagination list_key={list_key}
                          on_changed={this.onChangePage} />
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { list_key, header_list } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__ISSUE_HISTORY)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const filter = getListFilter(state, list_key)

    return {
        list_key: list_key,
        visible_item_ids,
        issue_histories: visible_items,
        issue_history_ids: visible_item_ids,
        loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading,
        last_updated,
        header_list,
        filter
    }
}

export default connect(mapStateToProps)(IssueHistoryList)
