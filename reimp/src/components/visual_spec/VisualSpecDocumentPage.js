import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import Modal from 'react-modal';
import { map, includes, compact } from 'lodash'
import { setBreadcrumbsActive } from '../../actions/Breadcrumbs'
import VisualSpecDocumentEditor from './VisualSpecDocumentEditor'
import VisualSpecDocumentGallery from './VisualSpecDocumentGallery'
import IssueList from '../../components/IssueList'
import IssueSidebar from '../../components/IssueSidebar'
import {
    ensureVisualSpecDocumentsLoaded,
    getVisualSpecDocument,
    getVisualSpecDocuments,
    invalidateVisualSpecDocuments,
    reorderVisualSpecDocument,
    associateVisualSpecDocumentWithIssue,
    unassociateVisualSpecDocumentWithIssue,
    unassociateVisualSpecDocumentWithProject
} from '../../actions/VisualSpecDocuments'
import {
    update_list_filter, setItemFlag, selectItems, update_list_format
} from '../../actions/ItemList'
import {
    setPageFlag
} from '../../actions/Page'
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
        this.addFromProjectGallery = this.addFromProjectGallery.bind(this)
        this.closeAddFromProjectGallery = this.closeAddFromProjectGallery.bind(this)
        this.associateDocumentWithIssue = this.associateDocumentWithIssue.bind(this)
        this.unassociateDocumentWithIssue = this.unassociateDocumentWithIssue.bind(this)
        this.unassociateDocumentWithProject = this.unassociateDocumentWithProject.bind(this)
        this.onSelectDocument = this.onSelectDocument.bind(this)
        this.state = { selecting_from_gallery: false }
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
             new_props.project.id != this.props.project.id ||
             new_props.issue_is_invalidated != this.props.issue_is_invalidated ) {
            this.refresh(new_props)
        }
    }
    
    addFromProjectGallery() {
        this.setState({selecting_from_gallery: true})
    }

    closeAddFromProjectGallery() {
        this.setState({selecting_from_gallery: false})
    }

    associateDocumentWithIssue(visual_spec_document_id) {
        const { dispatch, issue_id } = this.props
        dispatch(associateVisualSpecDocumentWithIssue(visual_spec_document_id, issue_id))
        this.closeAddFromProjectGallery()
    }

    unassociateDocumentWithIssue(visual_spec_document_id) {
        const { dispatch, issue_id } = this.props
        if ( ! confirm( "Remove this document from this issue? (It will still appear in the project gallery)") ) {
            return
        }
        dispatch(unassociateVisualSpecDocumentWithIssue(visual_spec_document_id, issue_id))
    }

    unassociateDocumentWithProject(visual_spec_document_id) {
        const { dispatch, project_id } = this.props
        if ( ! confirm( "Permanently remove this document from this project?") ) {
            return
        }
        dispatch(unassociateVisualSpecDocumentWithProject(visual_spec_document_id, project_id))
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
                project, project_id, sprint, sprint_id, issue, issue_id, visual_spec_document_ids } = props

        dispatch(ensureProjectsLoaded([project_id]))
        if ( sprint_id ) {
            dispatch(ensureSprintsLoaded([sprint_id]))
        }
        if ( issue_id ) {
            dispatch(ensureIssuesLoaded([issue_id]))
            dispatch(update_list_filter(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, {sprint_id: sprint_id || -1}))
            dispatch(selectItems(LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST, [issue_id]))
        }
        if ( active_visual_spec_document_id ) {
            dispatch(setPageFlag(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                 "active_visual_spec_document_id",
                                 active_visual_spec_document_id))
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
            
        } else if ( project && project.id ) {
            dispatch(setBreadcrumbs([{to: '/projects', label: 'Projects'},
                                     {to: '/projects/' + project.id, label: project.name},
                                     {to: '/projects/'+project.id+'/gallery/', label: "Gallery"},
                                     {to: '/projects/'+project.id+'/gallery/'+active_visual_spec_document_id, label: active_visual_spec_document.name}]))

            dispatch(select_projects(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                     [active_visual_spec_document.project_id]))
        }
    }

    onSelectIssues(selected_issue_ids) {
        const { dispatch, visual_spec_documents,
                project_id, sprint_id, issue_id, active_visual_spec_document_id } = this.props
        if ( !selected_issue_ids || !selected_issue_ids.length ) {
            return
        }
        const selected_issue_id = selected_issue_ids[0]
        const vsd_id = compact(map(visual_spec_documents, (vsd) => { return includes(vsd.issue_ids, selected_issue_id) && vsd.id }))[0]
        browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + selected_issue_id + '/visualSpec/' + vsd_id)
    }

    onSelectDocument(visual_spec_document_id) {
        const {project_id, sprint_id, issue_id} = this.props
        if ( issue_id ) {
            browserHistory.push('/projects/' + project_id + '/sprints/' + sprint_id + '/issues/' + issue_id + '/visualSpec/' + visual_spec_document_id)
        } else {
            browserHistory.push('/visualSpec/' + visual_spec_document_id)
        }
    }

    renderSelectForIssue() {
        const { issue_id, visual_spec_document_ids_for_project, project_id } = this.props
        const { selecting_from_gallery } = this.state

        if ( ! selecting_from_gallery ) {
            return (
                <div>
                  <button className="button button--primary" onClick={this.addFromProjectGallery}>Add from Gallery</button>
                </div>
            )
        }

        if ( selecting_from_gallery ) {
            return (
                <Modal isOpen={true}
                       className="visual_spec_document_page__project_gallery_modal"
                       overlayClassName="visual_spec_document_page__project_gallery_modal__overlay"
                       onRequestClose={this.closeAddFromProjectGallery}
                       contentLabel={"Select from project gallery"}>
                  <div>
                    <VisualSpecDocumentGallery visual_spec_document_ids={visual_spec_document_ids_for_project}
                                               reorderDocuments={this.reorderDocuments}
                                               project_id={project_id}
                                               allow_edit={false}
                                               onSelect={this.associateDocumentWithIssue} />
                    <button className="button button--primary" onClick={this.closeAddFromProjectGallery}>Cancel</button>
                  </div>
                </Modal>
            )
        }
    }
    
    render() {

        const { visual_spec_document_ids,
                active_visual_spec_document_id,
                visual_spec_documents_editor_urls,
                issue, issue_id, project_id, 
                issue_header_list } = this.props
        
        return (
            <div>
              <div className="visual_spec_document_page__gallery">
                { visual_spec_document_ids &&
                  <VisualSpecDocumentGallery visual_spec_document_ids={visual_spec_document_ids}
                                             active_visual_spec_document_id={active_visual_spec_document_id}
                                             reorderDocuments={this.reorderDocuments}
                                             onDeleteDocument={(issue_id && this.unassociateDocumentWithIssue) || this.unassociateDocumentWithProject}
                                             project_id={project_id}
                                             issue_id={issue_id}
                                             onSelect={this.onSelectDocument}
                  />
                }
                { ! visual_spec_document_ids &&
                  <div>Loading...</div>
                }
              </div>
              { issue.id && 
                <div className="visual_spec_document_page__content">
                  <div className="visual_spec_document_page__issue_list">
                    <IssueList list_key={LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST}
                               issue_header_list={issue_header_list}
                               onSelectIssues={this.onSelectIssues}
                               onDelete={this.onDeleteIssue}
                    /> 
                  </div>
                  <div className="list-layout__sidebar visual_spec_document_page__issue_sidebar">
                    <IssueSidebar issue_id={issue.id} sprint_id={issue.sprint_id} project_id={issue.project_id}/>
                  </div>
                  <div className="visual_spec_document_page__doc_editor">
                    { this.renderSelectForIssue() }
                    <VisualSpecDocumentEditor visual_spec_document_id={active_visual_spec_document_id}
                                              issue_id={issue_id} />
                  </div>
                </div>
              }
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
    const visual_spec_document_ids_for_project = (project && project.visual_spec_document_ids) || []
    const visual_spec_documents = getVisualSpecDocuments(state, visual_spec_document_ids) || []
    const visual_spec_documents_editor_urls = map(visual_spec_documents, (vsd) => { return vsd.lores_url })
    const issue_header_list = ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE
    const issue_is_invalidated = is_issue_invalidated(state, issue_id)
    
    return {
        active_visual_spec_document_id,
        visual_spec_document_ids,
        visual_spec_document_ids_for_project,
        active_visual_spec_document,
        visual_spec_documents,
        visual_spec_documents_editor_urls,
        project: project || {},
        project_id,
        sprint,
        sprint_id,
        issue,
        issue_id,
        is_loaded,
        issue_header_list,
        issue_is_invalidated
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentPage)
