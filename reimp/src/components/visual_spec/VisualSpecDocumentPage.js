import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbsActive } from '../../actions/Breadcrumbs'
import VisualSpecDocumentEditor from './VisualSpecDocumentEditor'
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'
import { PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE } from '../../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_projects,
    select_sprints,
    select_issues,
    get_selected_project_ids
} from '../../actions/Page'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import { ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import { ensureIssuesLoaded, getIssue } from '../../actions/Issues'
import {setBreadcrumbs} from '../../actions/Breadcrumbs'

class VisualSpecDocumentPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(set_toolbars(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE, ['visual-spec-document']))
        dispatch(setBreadcrumbsActive(true))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.visual_spec_document_id != this.props.visual_spec_document_id ||
             new_props.visual_spec_document.loaded != this.props.visual_spec_document.loaded ||
             new_props.is_loaded != this.props.is_loaded ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document, visual_spec_document_id,
                project, project_id, sprint, sprint_id, issue, issue_id } = props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureIssuesLoaded([issue_id]))
        if ( project && project.id && sprint && sprint.id && issue && issue.id ) {
            dispatch(setBreadcrumbs([{to: '/projects', label: 'All Projects'},
                                     {to: '/projects/' + project.id, label: project.name},
                                     {to: '/projects/'+project.id+'/sprints', label: 'All Sprints'},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues', label: 'All Issues'},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues/'+issue.id, label: '#'+issue.number},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues'+issue.id+'/visualSpec/'+visual_spec_document_id,
                                      label: visual_spec_document.name}]))

            dispatch(select_projects(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                     [visual_spec_document.project_id]))
            dispatch(select_sprints(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                    [visual_spec_document.sprint_id]))
            dispatch(select_issues(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                   [visual_spec_document.issue_id]))
        }
    }
    
    render() {

        const { visual_spec_document_id } = this.props
        
        return (
            <div>
              <VisualSpecDocumentEditor visual_spec_document_id={visual_spec_document_id} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const visual_spec_document_id = props.params.visualSpecDocumentId
    const project_id = props.params.projectId
    const sprint_id = props.params.sprintId
    const issue_id = props.params.issueId
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || { "loaded": false}
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id)
    const issue = getIssue(state, issue_id)
    const is_loaded = project && project.id && sprint && sprint.id && issue && issue.id
    
    return {
        visual_spec_document_id,
        visual_spec_document,
        project,
        project_id,
        sprint,
        sprint_id,
        issue,
        issue_id,
        is_loaded
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentPage)
