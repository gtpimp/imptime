import React, {Component} from 'react'
import Pluralize from 'react-pluralize'
import ModalDialog from './ModalDialog'
import {connect} from 'react-redux'
import {css} from 'emotion'
import Floater from 'react-floater'
import IssueList from './IssueList'
import {default_theme as theme} from '../theme/default'
import {
    LIST_KEY__MY_ISSUE_LIST_DUE_NOW,
    LIST_KEY__MY_ASSIGNED_ISSUE_LIST,
    HEADER_LIST_NAME__DUE_ISSUE
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
    ALL_AVAILABLE_POPUP_ISSUE_HEADERS
} from '../actions/Issues'
import PopupPanelHeading from './PopupPanelHeading'
import PopupPanelSeparator from './PopupPanelSeparator'

class DueIssueList extends Component {
    constructor(props) {
        super(props)
        this.state = {show_popup: false}
    }

    componentDidMount() {
        const { dispatch, list_key, assigned_list_key, logged_in_user_id } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_filter(list_key, { 'is_open': true,
                                                'due_now': true,
                                                'assigned_to_ids': [logged_in_user_id] }))

        dispatch(initList(assigned_list_key))
        dispatch(update_list_filter(assigned_list_key, { 'is_open': true,
                                                         'due_now': false,
                                                         'assigned_to_ids': [logged_in_user_id] }))
        
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

    onHidePopup = () => {
        // Passing state changes to another can lead to errors if 
        this.setState({show_popup:false})
    }

    onShowPopup = () => {
        this.setState({show_popup:true})
    }

    onIssueAction = (action_name, issue) => {
        if ( action_name === "view_in_sprint" ) {
            this.onHidePopup()
        }
    }

    renderDueAlert() {
        const { num_issues, num_assigned_issues } = this.props
        if (num_issues === 0 && num_assigned_issues === 0 ) {
            return null
        }

        const notification_colour = (num_issues>0 && theme.colours.notok) || theme.colours.ok

        return (
            <div className={css`color:${notification_colour};
                                font-size:${theme.colours.superscript}`}
                 onClick={this.onShowPopup}
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
                             <div>
                               and {num_assigned_issues} open&nbsp;
                               <Pluralize singular="issue"
                                                  showCount={false}
                                                  count={num_issues}/>
                                                        &nbsp; not due today.
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

    renderPopup() {
        const { list_key, assigned_list_key, header_list, num_issues, num_assigned_issues } = this.props
        const { show_popup } = this.state
        return (
            <ModalDialog isOpen={show_popup}
                         onClose={this.onHidePopup}
                         title=""
                         variant="full">

              { num_issues > 0 &&
                <div className={css`height:40%`}>
                  <PopupPanelHeading>Issues due today</PopupPanelHeading>
                  <IssueList list_key={list_key}
                             custom_issue_header_list={header_list}
                             custom_issue_header_list_name={HEADER_LIST_NAME__DUE_ISSUE}
                             table_params={{height:300}}
                             onAction={this.onIssueAction}
                  />
                  <PopupPanelSeparator />
                </div>
              }

              { num_assigned_issues > 0 &&
                <div className={css`height:40%`}>
                  <PopupPanelHeading>Other issues assigned to me</PopupPanelHeading>
                  <IssueList list_key={assigned_list_key}
                             custom_issue_header_list={header_list}
                             custom_issue_header_list_name={HEADER_LIST_NAME__DUE_ISSUE}
                             table_params={{height:300}}
                             onAction={this.onIssueAction}
                  />
                </div>
              }
              
            </ModalDialog>
        )
    }

    render() {
        return (
            <div>
              { this.renderDueAlert() }
              { this.renderPopup() }
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

export default connect(mapStateToProps)(DueIssueList)
