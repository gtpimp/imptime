import React, {Component} from 'react'
import {connect} from 'react-redux'
import ProjectList from '../components/ProjectList'
import ProjectSidebar from '../components/ProjectSidebar'
import NewProjectSidebar from '../components/NewProjectSidebar'
import MultipleProjectSidebar from '../components/MultipleProjectSidebar'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {
    LIST_KEY__PROJECT_LIST,
    PAGE_KEY__PROJECTS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    selectItems,
    expand_list
} from '../actions/ItemList'
import {
    set_toolbars,
    select_projects,
    get_selected_project_ids,
} from '../actions/Page'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {getCandidateProject} from '../actions/Projects'

class ProjectsPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectProjects = this.onSelectProjects.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__PROJECTS_PAGE, ['projects']))
        dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'} ]))
    }

    onSelectProjects(project_ids) {
        const { dispatch } = this.props
        dispatch(selectItems(LIST_KEY__PROJECT_LIST, project_ids))
        dispatch(select_projects(PAGE_KEY__PROJECTS_PAGE, project_ids))
    }
            
    render() {

        const {selected_projects, selected_project_ids, project_id,
               is_single_selection, is_multiple_selection, is_creating_project } = this.props
        const selected_project = ( selected_projects && selected_projects.length > 0 && selected_projects[0] ) || null
        
        return (
            <div className="list-layout">
                <div className="list-layout__list">
                    <ProjectList key="projects"
                                 list_key={LIST_KEY__PROJECT_LIST}
                                 onSelectProjects={this.onSelectProjects} />
                </div>
                { is_creating_project &&
                  <div className="list-layout__sidebar">
                      <NewProjectSidebar />
                  </div>
                }
                { ! is_creating_project && is_single_selection && selected_project &&
                  <div className="list-layout__sidebar">
                      <ProjectSidebar project_id={selected_project.id}/>
                  </div>
                }
                { ! is_creating_project && is_multiple_selection && selected_project_ids &&
                  <div className="list-layout__sidebar">
                      <MultipleProjectSidebar project_ids={selected_project_ids}/>
                  </div>
                }                  
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {project} = state
    const items_by_id = (project && project.items_by_id) || {}
    const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__PROJECTS_PAGE)

    const selected_items = items_by_id && selected_project_ids && selected_project_ids.map(function (selected_id, index) {
        return items_by_id[selected_id] || {'id': selected_id,
                                            'loaded': false }
    })

    const candidate_project = getCandidateProject(state) || null
    const is_creating_project = candidate_project || false
    
    return {
        selected_projects: selected_items,
        selected_project_ids: selected_project_ids,
        is_single_selection: selected_items.length === 1,
        is_multiple_selection: selected_items.length > 1,
        is_creating_project: is_creating_project
        
    }
}

export default connect(mapStateToProps)(ProjectsPage)

