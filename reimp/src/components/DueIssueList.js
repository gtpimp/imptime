import React, {Component} from 'react'
import Pluralize from 'react-pluralize'
import ModalDialog from './ModalDialog'
import {connect} from 'react-redux'
import {css} from 'emotion'
import Floater from 'react-floater'
import IssueList from './IssueList'
import {default_theme as theme} from '../theme/default'
import {
    LIST_KEY__MY_ISSUE_LIST_DUE_NOW
} from '../actions/ItemListKeyRegistry'
import { logged_in_user } from '../actions/Auth'
import {
    initList,
    getVisibleItemIds,
    update_list_filter,
    getListFilter,
    getListPagination
} from '../actions/ItemList'
import {
    fetchIssuesIfNeeded,
    getIssuesById,
    getDefaultPopupIssueHeaders
} from '../actions/Issues'

class DueIssueList extends Component {
    constructor(props) {
        super(props)
        this.state = {show_popup: false}
    }

    componentDidMount() {
        const { dispatch, list_key, logged_in_user_id } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_filter(list_key, { 'is_open': true,
                                                'due_now': true,
                                                'assigned_to_ids': [logged_in_user_id] }))
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

    onHidePopup = () => {
        this.setState({show_popup:false})
    }

    onShowPopup = () => {
        this.setState({show_popup:true})
    }

    renderDueAlert() {
        const { pagination } = this.props
        const num_issues = pagination && pagination.num_items
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
                       placement="left"
                       content={<div>You have {num_issues} open&nbsp;<Pluralize singular="issue" showCount={false} count={num_issues}/>&nbsp;due today.</div>}>
                <div className={css`border-radius: 10px; 
                                    min-width:20px; 
                                    border: 1px solid ${theme.colours.notok}; 
                                    text-align:center;`}>
                  {num_issues}
                </div>
              </Floater>
            </div>
        )
    }

    renderPopup() {
        const { list_key, header_list } = this.props
        return (
            <ModalDialog isOpen={true}
                         onClose={this.onHidePopup}
                         title="Issues due today"
                         variant="large">
              <IssueList list_key={list_key} issue_header_list={header_list} />
            </ModalDialog>
        )
    }

    render() {
        const { show_popup } = this.state

        return (
            <div>
              { this.renderDueAlert() }
              { show_popup && this.renderPopup() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__MY_ISSUE_LIST_DUE_NOW
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getIssuesById(state, visible_item_ids)
    const filter = getListFilter(state, list_key)
    const logged_in_user_id = logged_in_user().user_id || -1
    const pagination = getListPagination(state, list_key)
    const header_list = getDefaultPopupIssueHeaders()

    return {
        list_key,
        items_by_id,
        filter,
        logged_in_user_id,
        pagination,
        header_list
    }

}

export default connect(mapStateToProps)(DueIssueList)
