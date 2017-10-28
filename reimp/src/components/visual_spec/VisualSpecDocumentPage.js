import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbsActive } from '../../actions/Breadcrumbs'
import VisualSpecDocumentEditor from './VisualSpecDocumentEditor'
import VisualSpecDocumentGallery from './VisualSpecDocumentGallery'
import IssueList from '../../components/IssueList'
import {
    ensureVisualSpecDocumentsLoaded, getVisualSpecDocument
} from '../../actions/VisualSpecDocuments'
import {
    update_list_filter, setItemFlag
} from '../../actions/ItemList'
import { PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
         LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST,
         ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE
} from '../../actions/ItemListKeyRegistry'
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
import '../../sass/visual-spec-document-page.scss'

class VisualSpecDocumentPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(set_toolbars(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE, ['visual-spec-document']))
        dispatch(setBreadcrumbsActive(true))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.active_visual_spec_document_id != this.props.active_visual_spec_document_id ||
             new_props.active_visual_spec_document.loaded != this.props.active_visual_spec_document.loaded ||
             new_props.is_loaded != this.props.is_loaded ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, active_visual_spec_document, active_visual_spec_document_id,
                project, project_id, sprint, sprint_id, issue, issue_id } = props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureIssuesLoaded([issue_id]))
        dispatch(ensureVisualSpecDocumentsLoaded([active_visual_spec_document_id]))
        if ( project && project.id && sprint && sprint.id && issue && issue.id ) {
            dispatch(setBreadcrumbs([{to: '/projects', label: 'All Projects'},
                                     {to: '/projects/' + project.id, label: project.name},
                                     {to: '/projects/'+project.id+'/sprints', label: 'All Sprints'},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues', label: 'All Issues'},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues/'+issue.id, label: '#'+issue.number},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues'+issue.id+'/visualSpec/'+active_visual_spec_document_id,
                                      label: active_visual_spec_document.name}]))

            dispatch(select_projects(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                     [active_visual_spec_document.project_id]))
            dispatch(select_sprints(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                    [active_visual_spec_document.sprint_id]))
            dispatch(select_issues(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                   [active_visual_spec_document.issue_id]))
            dispatch(update_list_filter(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, {parent_group_id: issue_id || -1}))
            dispatch(setItemFlag(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, [issue_id], 'expanded_issues', true))
        }
    }
    
    render() {

        const { visual_spec_document_ids,
                active_visual_spec_document_id,
                issue,
                issue_header_list } = this.props
        
        return (
            <div>
              <div className="visual_spec_document_page__gallery">
                { issue.id &&
                  <VisualSpecDocumentGallery visual_spec_document_ids={issue.visual_spec_document_ids}
                                             active_visual_spec_document_id={active_visual_spec_document_id} />
                }
                  { ! issue.id &&
                    <div>Loading...</div>
                  }
              </div>
              <div className="visual_spec_document_page__content">
                <div className="visual_spec_document_page__issue_list">
                  { issue.id && 
                    <IssueList list_key={LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST}
                               issue_header_list={issue_header_list}
                    />
                  }
                </div>
                <div>
                  <VisualSpecDocumentEditor visual_spec_document_id={active_visual_spec_document_id} />
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const active_visual_spec_document_id = props.params.visualSpecDocumentId
    const project_id = props.params.projectId
    const sprint_id = props.params.sprintId
    const issue_id = props.params.issueId
    const active_visual_spec_document = getVisualSpecDocument(state, active_visual_spec_document_id) || { "loaded": false}
    const project = getProject(state, project_id)
    const sprint = getSprint(state, sprint_id)
    const issue = getIssue(state, issue_id) || {}
    const is_loaded = project && project.id && sprint && sprint.id && issue && issue.id
    const visual_spec_document_ids = issue.visual_spec_document_ids || []
    const issue_header_list = ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE
    
    return {
        active_visual_spec_document_id,
        visual_spec_document_ids,
        active_visual_spec_document,
        project,
        project_id,
        sprint,
        sprint_id,
        issue,
        issue_id,
        is_loaded,
        issue_header_list
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentPage)
