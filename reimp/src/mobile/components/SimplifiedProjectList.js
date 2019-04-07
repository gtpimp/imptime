import React, {Component} from 'react'
import { connect } from 'react-redux'
import {withRouter} from 'react-router-dom'
import { map } from 'lodash'
import {
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLoadingItemIds
} from '../../actions/ItemList'
import {
    fetchProjectsIfNeeded
} from '../../actions/Projects'
import SimplifiedLoading from './SimplifiedLoading'
import { ENTITY_KEY__PROJECT } from '../../actions/ItemListKeyRegistry'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'


class SimplifiedProjectList extends Component {

    componentDidMount() {
        const { dispatch, list_key } = this.props
        dispatch(fetchProjectsIfNeeded(list_key))
    }
    
    componentDidUpdate(old_props) {
        const { dispatch, list_key } = this.props
        dispatch(fetchProjectsIfNeeded(list_key))
    }

    onSelectProject(evt, project) {
        const { history } = this.props
        evt.preventDefault()
        history.push(`/wd/projects/${project.id}/`)
    }
    
    renderProject(project) {
        return (
            <div key={project.id}
                 className={project_row}
                 onClick={(evt) => this.onSelectProject(evt, project)}>
              {project.name}
            </div>
        )
    }
    
    render() {
        const { projects, is_loading } = this.props

        if ( is_loading ) {
            return <SimplifiedLoading/>
        }
        
        return (
            <div>
              { map(projects, (project) => this.renderProject(project) )}
            </div>
        )
        
    }
}

function mapStateToProps(state, props) {
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__PROJECT)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)

    return {
        list_key: list_key,
        visible_item_ids,
        projects: visible_items,
        project_ids: visible_item_ids,
        loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading
    }
}

export default withRouter(connect(mapStateToProps)(SimplifiedProjectList))

const project_row = css`
    margin-bottom: ${theme.spacing.two}
`
