import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setFeatureBreadcrumbsHelper } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {
    PAGE_KEY__BULK_CREATE_FEATURES_PAGE,
    PAGE_KEY__FEATURES_PAGE,
    LIST_KEY__FEATURE_LIST
} from '../actions/ItemListKeyRegistry.js'
import {
    selectItems,
} from '../actions/ItemList'
import BulkFeatureCreatorForm from '../components/form/BulkFeatureCreatorForm.js'
import { bulkCreateFeatures } from '../actions/Features'
import {
    set_toolbars,
    setPageSelectedEntities
} from '../actions/Page'

class BulkFeatureCreatorPage extends Component {

    constructor(props) {
        super(props)
        this.onSubmitBulkCreate = this.onSubmitBulkCreate.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onFeaturesCreated = this.onFeaturesCreated.bind(this)
    }

    componentDidMount() {
        const {project_id, dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__BULK_CREATE_FEATURES_PAGE, ['bulk-feature-creator']))
        dispatch(ensureProjectsLoaded([project_id]))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))

        if ( new_props.project.name !== this.props.project.name) {
            this.refresh(new_props.project)
        }
    }

    onCancel() {
        const { project_id, history } = this.props
        history.push('/projects/' + project_id + '/features')
    }

    onFeaturesCreated(new_feature_ids) {
        const { dispatch, history, project_id } = this.props
        dispatch(setPageSelectedEntities(PAGE_KEY__FEATURES_PAGE,
                                 {project_ids: [project_id],
                                  feature_ids: new_feature_ids}))
        dispatch(selectItems(LIST_KEY__FEATURE_LIST, new_feature_ids))
        history.push('/projects/' + project_id + "/features/")
    }
    
    onSubmitBulkCreate(new_values) {
        const { dispatch, project_id } = this.props
        dispatch(bulkCreateFeatures(project_id, new_values.bulk_feature_text,
                                    {auto_create_issues: new_values.auto_create_issues},
                                    this.onFeaturesCreated))
    }

    refresh(project) {
        const {dispatch} = this.props
        if ( project.id ) {
            dispatch(setPageSelectedEntities(PAGE_KEY__BULK_CREATE_FEATURES_PAGE,
                                     {project_ids: [project.id]}))
            dispatch(setFeatureBreadcrumbsHelper(project))
        }
    }

    render() {
        return (
            <div className="bulk-feature-creator-page">
              <BulkFeatureCreatorForm onCancel={this.onCancel} onSubmit={this.onSubmitBulkCreate}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const project_id = props.match.params.projectId
    const project = getProject(state, project_id) || {}
 
    return {
        project_id,
        project
    }
}

export default withRouter(connect(mapStateToProps)(BulkFeatureCreatorPage))
