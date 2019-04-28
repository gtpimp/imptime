import React, {Component} from 'react'
import {connect} from 'react-redux'
import IssueList from './IssueList'
import {
    HEADER_LIST_NAME__DUE_ISSUE
} from '../actions/ItemListKeyRegistry'
import { logged_in_user } from '../actions/Auth'
import {
    getVisibleItemIds,
    getListFilter,
    getListPagination
} from '../actions/ItemList'
import {
    fetchIssuesIfNeeded,
    getIssuesById,
    ALL_AVAILABLE_POPUP_ISSUE_HEADERS
} from '../actions/Issues'

class DueIssueList extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key } = props
        dispatch(fetchIssuesIfNeeded(list_key))
    }

    render() {
        const { list_key, header_list } = this.props
        return (
            <IssueList list_key={list_key}
                       custom_issue_header_list={header_list}
                       custom_issue_header_list_name={HEADER_LIST_NAME__DUE_ISSUE}
            />
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getIssuesById(state, visible_item_ids)
    const filter = getListFilter(state, list_key)
    const logged_in_user_id = logged_in_user(state).user_id || -1
    const pagination = getListPagination(state, list_key)
    const header_list = ALL_AVAILABLE_POPUP_ISSUE_HEADERS
    const num_issues = pagination && pagination.num_items

    return {
        list_key,
        items_by_id,
        filter,
        logged_in_user_id,
        header_list,
        num_issues,
    }

}

export default connect(mapStateToProps)(DueIssueList)
