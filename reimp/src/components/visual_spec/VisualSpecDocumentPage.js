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
    get_selected_project_ids
} from '../../actions/Page'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
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
             new_props.project_id != this.props.project_id ) {
            this.refresh(new_props)
        }
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, visual_spec_document, visual_spec_document_id, project, project_id } = props
        dispatch(ensureProjectsLoaded([project_id]))
        if ( project && project.id ) {
            dispatch(setBreadcrumbs([{to: '/projects', label: 'All Projects'},
                                     {to: '/projects/' + project.id, label: project.name},
                                     {to: '/projects/' + project.id + '/visualSpec/' + visual_spec_document_id, label: visual_spec_document.name}]))

            dispatch(select_projects(PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE,
                                     [visual_spec_document.project_id]))
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
    const visual_spec_document = getVisualSpecDocument(state, visual_spec_document_id) || { "loaded": false}
    const project = getProject(state, project_id)
    
    return {
        visual_spec_document_id,
        visual_spec_document,
        project,
        project_id
    }
}

export default connect(mapStateToProps)(VisualSpecDocumentPage)
