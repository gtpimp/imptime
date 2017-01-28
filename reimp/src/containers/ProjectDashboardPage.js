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
        this.navigateToSprintsPage = this.navigateToSprintsPage.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
    }

    navigateToSprintsPage() {
        const { project_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints');
    }

    render() {

        const { project_id } = this.props
        
        return (
            <div>
                Project {project_id}

                <pre>
                    I am your project page
                </pre>
                
                <button onClick={this.navigateToSprintsPage}>Take me to your sprints</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {} = state

    const project_id = props.params.projectId
    return {
        project_id: project_id
    }
}

export default connect(mapStateToProps)(ProjectDashboardPage)

