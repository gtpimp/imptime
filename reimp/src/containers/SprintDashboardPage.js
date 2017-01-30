import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    PAGE_KEY__SPRINT_DASHBOARD_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_sprints
} from '../actions/Page'

class ProjectDashboardPage extends Component {

    constructor(props) {
        super(props)
        this.navigateToIssuesPage = this.navigateToIssuesPage.bind(this)
    }

    componentDidMount() {
        const {sprint_id, project_id, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINT_DASHBOARD_PAGE, ['sprint-dashboard']))
        this.refresh(sprint_id, project_id)
    }

    componentWillReceiveProps(new_props) {
        const { sprint_id } = this.props
        if ( new_props.sprint_id !== sprint_id ) {
            this.refresh(new_props.sprint_id, new_props.project_id)
        }
    }

    refresh(sprint_id, project_id) {
        const { dispatch } = this.props
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                  {to: '/projects/'+project_id, label: project_id},
                                  {to: '/projects/'+project_id+'/sprints', label: 'All Sprints'},
                                  {to: '/projects/'+project_id+'/sprints/'+sprint_id, label: sprint_id} ]))
        dispatch(select_sprints(PAGE_KEY__SPRINT_DASHBOARD_PAGE, [sprint_id]))
    }

    navigateToIssuesPage() {
        const { project_id, sprint_id } = this.props
        browserHistory.push('/projects/'+project_id+'/sprints/'+sprint_id+'/issues');
    }
    
    render() {

        const { sprint_id } = this.props
        
        return (
            <div>
                Sprint {sprint_id}

                <pre>
                    I am your sprint dashboard
                </pre>
                
                <button onClick={this.navigateToIssuesPage}>Take me to your issues</button>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const project_id = props.params.projectId
    const sprint_id = props.params.sprintId
    
    return {
        project_id: project_id,
        sprint_id: sprint_id
    }
}

export default connect(mapStateToProps)(ProjectDashboardPage)

