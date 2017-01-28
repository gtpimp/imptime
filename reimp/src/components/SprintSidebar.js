import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {StickyContainer} from 'react-sticky';
import { setBreadcrumbs } from '../actions/Breadcrumbs'
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

class SprintSidebar extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    render() {

        const { sprint_id } = this.props
        
        return (
            <div class="sprint_sidebar">
                Sprint {sprint_id}

                <pre>
                    I am your sprint sidebar
                </pre>
                
                <button onClick={this.navigateToIssuesPage}>Take me to your issues</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const { sprint_id, project_id } = props
    return {
        sprint_id: sprint_id,
        project_id: project_id
    }
}

export default connect(mapStateToProps)(SprintSidebar)

