import React, {Component} from 'react'
import { map, slice, size } from 'lodash'
import {connect} from 'react-redux'
import {css} from 'emotion'
import Floater from 'react-floater'
import {default_theme as theme} from '../../theme/default'
import {
    LIST_KEY__MY_ISSUE_LIST_DUE_NOW
} from '../../actions/ItemListKeyRegistry'
import { logged_in_user } from '../../actions/Auth'
import {
    initList,
    shouldFetchList,
    getVisibleItemIds,
    getNestedObjects,
    ensureNestedObjectsLoaded,
    isLoading,
    getLastUpdated,
    update_list_filter,
    getListFilter,
    getListPagination
} from '../../actions/ItemList'

class DueIssueList extends Component {
    constructor(props) {
        super(props)
        this.state = {show_popup: false}
    }

    componentDidMount() {
        const { dispatch, list_key, logged_in_user_id } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_filter(list_key_by_issue, { 'is_open': true,
                                                         'due_now': true,
                                                         'assigned_to_ids': [logged_in_user_id] }))
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        
        dispatch(fetchIssuesIfNeeded(list_key))
    }

    onHidePopup() {
        this.setState({show_popup:false})
        hideAutoClockPopup()
    }

    onShowPopup() {
        this.setState({show_popup:true})
        showAutoClockPopup()
    }

    renderDueAlert() {
        const { pagination_unallocated } = this.props
        const num_issues = issues_pagination && issues_pagination.num_items
        if ( num_issues === 0 ) {
            return null
        }
        return (
            <div className={css`color:${theme.colours.notok};
                                font-size:${theme.colours.superscript}`}
                 onClick={this.onShowPopup}
            >
              <Floater title="Due issues"
                       disableHoverToClick
                       event="hover"
                       eventDelay={0}
                       placement="right"
                       content={<div>You have {num_issues} open issues due today.</div>}>
                {num_issues}
              </Floater>
            </div>
        )
    }

    render() {
        const { show_popup } = this.state

        return (
            <div>
              { this.renderDueAlert() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__RECENT_AUTO_CLOCK
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getIssues(state, visible_item_ids)
    const filter = getListFilter(state, list_key)
    const logged_in_user_id = logged_in_user().user_id || -1
    const pagination = getListPagination(state, list_key)

    return {
        list_key,
        items_by_id,
        filter,
        logged_in_user_id,
        pagination
    }

}

export default connect(mapStateToProps)(DueIssueList)
