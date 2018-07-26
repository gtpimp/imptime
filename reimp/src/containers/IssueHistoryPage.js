import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import IssueHistoryList from '../components/IssueHistoryList'
import {
    LIST_KEY__ISSUE_HISTORY_LIST,
    PAGE_KEY__ISSUE_HISTORY_PAGE,
    ISSUE_HISTORY_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    update_list_pagination,
} from '../actions/ItemList'
import {
    set_toolbars,
} from '../actions/Page'

class IssueHistoryPage extends Component {

    componentDidMount() {
        const {issue_id, dispatch, list_key} = this.props
        dispatch(set_toolbars(PAGE_KEY__ISSUE_HISTORY_PAGE, []))
        dispatch(update_list_filter(list_key, {issue_id: issue_id}))
        dispatch(update_list_pagination(list_key, {page_size: 50}))
    }

    render() {
        const { issue_history_header_list, list_key} = this.props
        return (
            <div className="list-layout__list">
              <IssueHistoryList list_key={list_key}
                                header_list={issue_history_header_list} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const issue_id = props.match.params.issueId
    const issue_history_header_list = ISSUE_HISTORY_HEADER_LIST
    
    return {
        issue_history_header_list,
        issue_id, 
        list_key: LIST_KEY__ISSUE_HISTORY_LIST,
    }
}

export default withRouter(connect(mapStateToProps)(IssueHistoryPage))
