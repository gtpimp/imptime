import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import ProjectList from '../components/ProjectList'
import {browserHistory} from 'react-router'
import SprintList from '../components/SprintList'
import IssueList from '../components/IssueList'
import IssueDetails from '../components/IssueDetails'
import IssueDeveloperDetails from '../components/IssueDeveloperDetails'
import {StickyContainer} from 'react-sticky';
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST,
    LIST_KEY__ISSUE_DEVELOPER_DETAILS
} from '../actions/ItemListKeyRegistry'
import {
    initList,
    invalidateList,
    selectItems,
    collapse_list,
    expand_list
} from '../actions/ItemList'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectProjects = this.onSelectProjects.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(expand_list(LIST_KEY__PROJECT_LIST))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'} ]))
    }

    onSelectProjects(project_ids) {
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_LIST, project_ids))

        if ( project_ids.length == 1 ) {
            browserHistory.push('/projects/'+project_ids[0]);
        }
    }

    render() {

        return (
            <div>
                <StickyContainer>
                    <ProjectList key="projects"
                                 list_key={LIST_KEY__PROJECT_LIST}
                                 onSelectProjects={this.onSelectProjects}
                    />
                </StickyContainer>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {} = state

    return {}
}

export default connect(mapStateToProps)(ProjectsPage)

