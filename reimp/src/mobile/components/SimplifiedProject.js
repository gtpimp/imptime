import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {
    ensureProjectsLoaded,
    getProject,
    isLoadingProjects
} from '../../actions/Projects'
import SimplifiedParagraph from './SimplifiedParagraph'
import SimplifiedSprintList from './SimplifiedSprintList'
import { LIST_KEY__SPRINT_LIST } from '../../actions/ItemListKeyRegistry'

class SimplifiedProject extends Component {

    componentDidMount() {
        const { dispatch, project_id } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
    }

    componentDidUpdate(old_props) {
        const { dispatch, project_id } = this.props
        if ( old_props.project_id !== project_id ) {
            dispatch(ensureProjectsLoaded([project_id]))
        }
    }
    
    render() {
        const { project, is_loading } = this.props

        if ( is_loading ) {
            return null
        }
        
        return (
            <div>
              <SimplifiedParagraph>
                {project.description}
                <SimplifiedSprintList project_id={project.id}
                                      list_key={LIST_KEY__SPRINT_LIST} />
              </SimplifiedParagraph>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id } = props
    const project = getProject(state, project_id)
    const is_loading = isLoadingProjects(state, [project_id]) || !project

    return {
        project_id,
        project,
        is_loading
    }
    
}

export default withRouter(connect(mapStateToProps)(SimplifiedProject))
