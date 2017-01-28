import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {StickyContainer} from 'react-sticky';
import { IssueDetails2 } from '../components/IssueDetails2'
import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__ISSUE_DEVELOPER_DETAILS
} from '../actions/ItemListKeyRegistry'
import {
    expand_list,
    selectItems
} from '../actions/ItemList'

class IssueSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    render() {

        const { project_id, sprint_id, issue_id } = this.props
        
        return (

            <div>
                I am your issues sidebar for {issue_id}
                                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const { issue_id, sprint_id, project_id } = props
    return {
        issue_id: issue_id,
        sprint_id: sprint_id,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(IssueSidebar)

