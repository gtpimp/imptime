import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import { getIssue, ensureIssuesLoaded } from '../actions/Issues'
import Timestamp from './Timestamp'
import OtherUser from './OtherUser'

const main = css`
display: flex;
flex-direction: row;
font: ${theme.fonts.regular_normal};
color: ${theme.colours.normal_text};
`

const cell = css`
padding-right: 3px;
`

class SidebarAuthor extends Component {

    componentDidMount() {
        const { dispatch, issue_id } = this.props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch, issue_id } = new_props
        dispatch(ensureIssuesLoaded([issue_id]))
    }

    render() {
        const { issue } = this.props

        return (
            <div className={ main }>
              <div className={cell}>Created</div>
              <div className={cell}>
                <Timestamp value={issue.created_at} format="from_now" />
              </div>
              { issue.created_by_id &&
                <div className={cell}>by</div>
              }
              { issue.created_by_id &&
                <div className={cell}><OtherUser user_id={issue.created_by_id} /></div>
              }
            </div>
        )
    }
}
function mapStateToProps(state, props) {
    const { issue_id } = props
    const issue = getIssue(state, issue_id) || {}

    return {
        issue: issue
    }
}
export default connect(mapStateToProps)(SidebarAuthor)
