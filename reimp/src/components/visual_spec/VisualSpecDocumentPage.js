import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { map, includes, compact } from 'lodash'
import { setBreadcrumbsActive } from '../../actions/Breadcrumbs'
import VisualSpecDocumentEditor from './VisualSpecDocumentEditor'
import VisualSpecDocumentGallery from './VisualSpecDocumentGallery'
import IssueList from '../../components/IssueList'
import {
    ensureVisualSpecDocumentsLoaded,
    getVisualSpecDocument,
    getVisualSpecDocuments,
    invalidateVisualSpecDocuments,
    reorderVisualSpecDocument
    
} from '../../actions/VisualSpecDocuments'
import {
    update_list_filter, setItemFlag, selectItems, update_list_format
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
import { ensureIssuesLoaded, getIssue, is_issue_invalidated } from '../../actions/Issues'
import {setBreadcrumbs} from '../../actions/Breadcrumbs'
import '../../sass/visual-spec-document-page.scss'

class VisualSpecDocumentPage extends Component {

    constructor(props) {
        super(props)
        this.onSelectIssues = this.onSelectIssues.bind(this)
        this.reorderDocuments = this.reorderDocuments.bind(this)
    }
    
    componentDidMount() {
        const { dispatch } = this.props
        dispatch(set_toolbars(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE, ['visual-spec-document']))
        dispatch(setBreadcrumbsActive(true))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.active_visual_spec_document_id != this.props.active_visual_spec_document_id ||
             new_props.active_visual_spec_document.loaded != this.props.active_visual_spec_document.loaded ||
             new_props.is_loaded != this.props.is_loaded ||
             new_props.issue_is_invalidated != this.props.issue_is_invalidated ) {
            this.refresh(new_props)
        }
    }

    reorderDocuments(moving_visual_spec_document_id, move_after_visual_spec_document_id) {
        const {dispatch, visual_spec_document_ids, issue_id, project_id} = this.props
        const on_done = function () {
            dispatch(invalidateVisualSpecDocuments(visual_spec_document_ids))
        }
        const extra_post_data = { project_id: project_id, issue_id: issue_id }
        dispatch(reorderVisualSpecDocument(visual_spec_document_ids, moving_visual_spec_document_id,
                                           move_after_visual_spec_document_id, on_done, extra_post_data))
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, active_visual_spec_document, active_visual_spec_document_id,
                project, project_id, sprint, sprint_id, issue, issue_id, visual_spec_document_ids,
                issue_ids_for_active_visual_spec_document } = props

        dispatch(ensureProjectsLoaded([project_id]))
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
            dispatch(update_list_filter(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, {parent_group_id: issue_id || -1}))
        }
        dispatch(ensureVisualSpecDocumentsLoaded([active_visual_spec_document_id]))
        dispatch(ensureVisualSpecDocumentsLoaded(visual_spec_document_ids))
        if ( project && project.id && sprint && sprint.id && issue && issue.id ) {
            dispatch(setBreadcrumbs([{to: '/projects', label: 'Projects'},
                                     {to: '/projects/' + project.id, label: project.name},
                                     {to: '/projects/'+project.id+'/sprints', label: 'Sprints'},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues', label: 'Issues'},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues/'+issue.id, label: '#'+issue.number},
                                     {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues'+issue.id+'/visualSpec/'+active_visual_spec_document_id,
                                      label: active_visual_spec_document.name}]))

            dispatch(select_projects(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                     [active_visual_spec_document.project_id]))
            dispatch(select_sprints(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                    [active_visual_spec_document.sprint_id]))
            dispatch(select_issues(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                   [active_visual_spec_document.issue_id]))
            dispatch(setItemFlag(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, [issue_id], 'expanded_issues', true))
            dispatch(selectItems(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, issue_ids_for_active_visual_spec_document))
            
        } else if ( project && project.id ) {
            dispatch(setBreadcrumbs([{to: '/projects', label: 'Projects'},
                                     {to: '/projects/' + project.id, label: project.name},
                                     {to: '/projects/'+project.id+'/gallery/'+active_visual_spec_document_id,
                                      label: active_visual_spec_document.name}]))

            dispatch(select_projects(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                     [active_visual_spec_document.project_id]))
        }
    }

    onSelectIssues(selected_issue_ids) {
        const { dispatch, issue_ids_for_active_visual_spec_document, visual_spec_documents,
                project_id, sprint_id, issue_id, active_visual_spec_document_id } = this.props
        if ( !selected_issue_ids || !selected_issue_ids.length ) {
            return
        }
        const selected_issue_id = selected_issue_ids[0]
        if ( ! includes(issue_ids_for_active_visual_spec_document, selected_issue_id) ) {
            const vsd_id = compact(map(visual_spec_documents, (vsd) => { return includes(vsd.issue_ids, selected_issue_id) && vsd.id }))[0]
            browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + issue_id + '/visualSpec/' + vsd_id);
        }
    }
    
    render() {

        const { visual_spec_document_ids,
                active_visual_spec_document_id,
                visual_spec_documents_editor_urls,
                issue,
                issue_header_list } = this.props
        
        return (
            <div>
              <div className="visual_spec_document_page__gallery">
                { visual_spec_document_ids &&
                  <VisualSpecDocumentGallery visual_spec_document_ids={visual_spec_document_ids}
                                             active_visual_spec_document_id={active_visual_spec_document_id}
                                             reorderDocuments={this.reorderDocuments}/>
                }
                { ! visual_spec_document_ids &&
                  <div>Loading...</div>
                }
              </div>
              <div className="visual_spec_document_page__content">
                <div className="visual_spec_document_page__issue_list">
                  { issue.id && 
                  <IssueList list_key={LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST}
                             issue_header_list={issue_header_list}
                             onSelectIssues={this.onSelectIssues}
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
    const visual_spec_document_ids = (issue && issue.visual_spec_document_ids) || (project && project.visual_spec_document_ids) || []
    const visual_spec_documents = getVisualSpecDocuments(state, visual_spec_document_ids) || []
    const visual_spec_documents_editor_urls = map(visual_spec_documents, (vsd) => { return vsd.lores_url })
    const issue_header_list = ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE
    const issue_ids_for_active_visual_spec_document = (active_visual_spec_document.id && active_visual_spec_document.issue_ids) || []
    const issue_is_invalidated = is_issue_invalidated(state, issue_id)
    
    return {
        active_visual_spec_document_id,
        visual_spec_document_ids,
        active_visual_spec_document,
        visual_spec_documents,
        visual_spec_documents_editor_urls,
        project,
        project_id,
        sprint,
        sprint_id,
        issue,
        issue_id,
        is_loaded,
        issue_header_list,
        issue_ids_for_active_visual_spec_document,
        issue_is_invalidated
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentPage)
