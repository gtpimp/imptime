import React, {Component} from 'react'
import Pluralize from 'react-pluralize'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {css} from 'emotion'
import Floater from 'react-floater'
import {default_theme as theme} from '../theme/default'
import {
    LIST_KEY__MY_ISSUE_LIST_DUE_NOW,
    LIST_KEY__MY_ASSIGNED_ISSUE_LIST
} from '../actions/ItemListKeyRegistry'
import { logged_in_user } from '../actions/Auth'
import {
    getVisibleItemIds,
    update_list_filter,
    update_list_pagination,
    getListFilter,
    getListPagination
} from '../actions/ItemList'
import {
    fetchIssuesIfNeeded,
    getIssuesById,
    ALL_AVAILABLE_POPUP_ISSUE_HEADERS
} from '../actions/Issues'

class DueIssueListIndicator extends Component {
    constructor(props) {
        super(props)
        this.state = {show_popup: false}
    }

    componentDidMount() {
        const { dispatch, list_key, assigned_list_key, logged_in_user_id } = this.props
        dispatch(update_list_filter(list_key, { 'is_open': true,
                                                'due_now': true,
                                                'assigned_to_ids': [logged_in_user_id] }))
        dispatch(update_list_pagination(list_key, { page_size: 200 }))

        dispatch(update_list_filter(assigned_list_key, { 'is_open': true,
                                                         'due_now': false,
                                                         'assigned_to_ids': [logged_in_user_id] }))
        dispatch(update_list_pagination(assigned_list_key, { page_size: 200 }))
        
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, list_key, assigned_list_key } = props
        dispatch(fetchIssuesIfNeeded(list_key))
        dispatch(fetchIssuesIfNeeded(assigned_list_key))
    }

    onShowDueIssues = (evt) => {
        const { history } = this.props
        evt.preventDefault()
        history.push('/projects/issues/due')
    }

    onShowAssignedIssues = (evt) => {
        const { history } = this.props
        evt.preventDefault()
        history.push('/projects/issues/assigned')
    }

    renderDueAlert() {
        const { num_issues } = this.props

        const notification_colour = (num_issues>0 && theme.colours.notok) || theme.colours.ok

        return (
            <div className={css`color:${notification_colour};
                                cursor: pointer;
                                padding: ${theme.spacing.horizontal_row_space_tight};
                                margin-right: ${theme.spacing.horizontal_space_inline};
                                margin-left: ${theme.spacing.horizontal_space_inline};
                                font-size:${theme.colours.superscript}`}
                 onClick={this.onShowDueIssues}
            >
              <Floater title="Due issues"
                       disableHoverToClick
                       event="hover"
                       eventDelay={0}
                       placement="left"
                       content={
                           <div>
                             <div>
                               You have {num_issues} open&nbsp;
                               <Pluralize singular="issue"
                                                  showCount={false}
                                                  count={num_issues}/>
                                                        &nbsp;due today.
                             </div>
                           </div>
                               }>
              </Floater>
              <div className={css`border-radius: 10px; 
                                    min-width:20px; 
                                    border: 1px solid ${notification_colour}; 
                                    text-align:center;`}>
                {num_issues}
              </div>
            </div>
        )
    }

    renderAssignedAlert() {
        const { num_assigned_issues } = this.props

        const notification_colour = theme.colours.neutral

        return (
            <div className={css`color:${notification_colour};
                                cursor: pointer;
                                padding: ${theme.spacing.horizontal_row_space_tight};
                                margin-right: ${theme.spacing.horizontal_space_inline};
                                font-size:${theme.colours.superscript}`}
                 onClick={this.onShowAssignedIssues}
            >
              <Floater title="Assigned issues"
                       disableHoverToClick
                       event="hover"
                       eventDelay={0}
                       placement="left"
                       content={
                           <div>
                             <div>
                               You have {num_assigned_issues} open assigned &nbsp;
                               <Pluralize singular="issue"
                                                  showCount={false}
                                                  count={num_assigned_issues}/>
                                                        &nbsp;.
                             </div>
                           </div>
                               }>
              </Floater>
              <div className={css`border-radius: 10px; 
                                    min-width:20px; 
                                    border: 1px solid ${notification_colour}; 
                                    text-align:center;`}>
                {num_assigned_issues}
              </div>
            </div>
        )
    }

    render() {
        return (
            <div className={css`display:flex`}>
              { this.renderDueAlert() }
              { this.renderAssignedAlert() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__MY_ISSUE_LIST_DUE_NOW
    const assigned_list_key = LIST_KEY__MY_ASSIGNED_ISSUE_LIST
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = getIssuesById(state, visible_item_ids)
    const filter = getListFilter(state, list_key)
    const logged_in_user_id = logged_in_user(state).user_id || -1
    const pagination = getListPagination(state, list_key)
    const assigned_pagination = getListPagination(state, assigned_list_key)
    const header_list = ALL_AVAILABLE_POPUP_ISSUE_HEADERS
    const num_issues = pagination && pagination.num_items
    const num_assigned_issues = assigned_pagination && assigned_pagination.num_items

    return {
        list_key,
        assigned_list_key,
        items_by_id,
        filter,
        logged_in_user_id,
        header_list,
        num_issues,
        num_assigned_issues
    }

}

export default withRouter(connect(mapStateToProps)(DueIssueListIndicator))
