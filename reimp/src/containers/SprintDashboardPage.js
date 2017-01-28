import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {StickyContainer} from 'react-sticky';
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

class ProjectDashboardPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }

    render() {

        const { project_id, sprint_id } = this.props
        
        return (
            <div>
                Sprint {sprint_id}

                <pre>
                    I am your sprint page
                </pre>
                
                <button onClick={this.navigateToIssuesPage}>Take me to your issues</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const project_id = props.params.projectId
    const sprint_id = props.params.sprintId
    
    return {
        project_id: project_id,
        sprint_id: sprint_id
    }
}

export default connect(mapStateToProps)(ProjectDashboardPage)

