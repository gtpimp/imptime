import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import DueIssueList from '../components/DueIssueList'
import Splitter from '../components/Splitter'
import {
    LIST_KEY__MY_ISSUE_LIST_DUE_NOW,
    LIST_KEY__MY_ASSIGNED_ISSUE_LIST
} from '../actions/ItemListKeyRegistry'
import { getLoggedInUser } from '../actions/Users'
import {
    update_list_filter,
    getListFilter,
    invalidateList,
} from '../actions/ItemList'
import {
    setBrowserTitle
} from '../actions/Page'

class UserIssuesPage extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.filter_mode !== this.props.filter_mode ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const {dispatch, filter, list_key, filter_mode, logged_in_user_id} = these_props || this.props

        const new_filter = { 'is_open': true,
                             'due_now': filter_mode === 'due',
                             'assigned_to_ids': [logged_in_user_id] }

        if ( !filter || new_filter.due_now !== filter.due_now ) {
            dispatch(update_list_filter(list_key, new_filter))
            dispatch(invalidateList(list_key))
        }
    }

    renderLeftPane() {
        const { list_key } = this.props
        return (
            <DueIssueList list_key={list_key} />
        )

    }

    render() {
        setBrowserTitle("User issues")

        return (
            <Splitter name="issues_page">
              {this.renderLeftPane()}
              {null}
            </Splitter>
        )
    }
}

function mapStateToProps(state, props) {

    const filter_mode = props.match.params.filterMode
    const logged_in_user = getLoggedInUser(state) || {}
    let list_key = null

    if ( filter_mode === 'due' ) {
        list_key = LIST_KEY__MY_ISSUE_LIST_DUE_NOW
    } else {
        list_key = LIST_KEY__MY_ASSIGNED_ISSUE_LIST
    }
    const filter = getListFilter(state, list_key)
    
    return {
        filter_mode,
        list_key,
        filter,
        logged_in_user
    }
}

export default withRouter(connect(mapStateToProps)(UserIssuesPage))
