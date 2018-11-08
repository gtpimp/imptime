import React, {Component} from 'react'
import {connect} from 'react-redux'
import { map } from 'lodash'
import { css } from 'emotion'
import { ensureProjectsLoaded, getProject } from '../actions/Projects'
import { default_theme as theme } from '../theme/default'
import { logged_in_user } from '../actions/Auth'
import 'react-virtualized/styles.css';
import {
    makeSelInvalidatedFeatureIds,
    makeSelLoadingFeatureIds,
    makeSelTopLevelFeaturesList
} from '../selectors/FeatureListSelectors'
import {
    getLastUpdated,
    isLoading,
    getListFilter
} from '../actions/ItemList'
import {
    fetchFeaturesIfNeeded,
} from '../actions/Features'

const menu_item_container = css`
display: inline-flex;
flex-direction: row;
align-items: center;
cursor: pointer;
justify-content: flex-start;
background-color: ${theme.colours.subtle_background};
padding: ${theme.spacing.one};
border-radius: 5px;
margin: 0 ${theme.spacing.one} ${theme.spacing.one} 0;
`

class FlatFeatureNavigation extends Component {

    componentDidMount() {
        const {dispatch, list_key, project_id} = this.props
        if (project_id) {
            dispatch(fetchFeaturesIfNeeded(list_key))
            if ( project_id ) {
                dispatch(ensureProjectsLoaded([project_id]))
            }
            this.refresh()
        }
    }

    componentWillReceiveProps(new_props) {
        const {dispatch, list_key, project_id } = new_props
        dispatch(fetchFeaturesIfNeeded(list_key))
        dispatch(ensureProjectsLoaded([project_id]))
        this.refresh(new_props)
    }

    refresh(these_props) {
    }

    onClickFeature = (evt, feature) => {
        const { navigateToFeature } = this.props
        evt.preventDefault()
        navigateToFeature(feature.id)
    }

    renderFeatureLink(feature) {
        if ( ! feature ) {
            return null
        }
        return (
            <div key={`flat_feature_navigation_${feature.id}`}
                 className={menu_item_container}
                 onClick={(evt) => this.onClickFeature(evt, feature)}>
              {feature.name}
            </div>
        )
    }
    
    render() {
        const { top_level_features } = this.props
        return (
            <div className={css`display: flex`}>
              { map(top_level_features, (feature) => this.renderFeatureLink(feature) ) }
            </div>
        )
    }
}

const makeMapStateToProps = () => {
    const selInvalidatedFeatureIds = makeSelInvalidatedFeatureIds()
    const selLoadingFeatureIds = makeSelLoadingFeatureIds()
    const selTopLevelFeaturesList = makeSelTopLevelFeaturesList()
    const mapStateToProps = (state, props) => {
        const {list_key, navigateToFeature } = props
        const filter = getListFilter(state, list_key)
        const project_id = filter.project_id || null
        const project = getProject(state, project_id) || {}
        const loading_item_ids = selLoadingFeatureIds(state, props)
        const invalidated_item_ids = selInvalidatedFeatureIds(state, props)
        const logged_in_user_id = logged_in_user(state).user_id
        const top_level_features = selTopLevelFeaturesList(state, props)

        return {
            top_level_features,
            list_key: list_key,
            project_id: project_id,
            project,
            invalidated_feature_ids: invalidated_item_ids,
            loading_item_ids: loading_item_ids,
            is_loading: isLoading(state, list_key),
            last_updated: getLastUpdated(state, list_key),
            logged_in_user_id,
            navigateToFeature
        }
    }
    return mapStateToProps
}

export default connect(makeMapStateToProps)(FlatFeatureNavigation)
