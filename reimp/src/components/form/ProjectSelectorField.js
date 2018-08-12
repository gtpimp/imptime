import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field } from 'redux-form'
import { getProjects, fetchProjectsIfNeeded } from '../../actions/Projects'
import {
    SELECTOR__PROJECTS
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter,
    clear_list_filter_option,
    getListFilter,
    invalidateList
} from '../../actions/ItemList'
import SingleValueSelector from './SingleValueSelector'

class ProjectSelectorField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onFilterChanged = this.onFilterChanged.bind(this)
    }
    
    componentDidMount() {
        const { dispatch, default_project_id, list_key } = this.props
        dispatch(initList(list_key))
        dispatch(clear_list_filter_option(list_key, 'any_field'))
        dispatch(update_list_filter(list_key, {id: default_project_id}))

        // Hackish: initList doesn't properly clear the list, so previous filters remain.
        // And even though we clear_list_filter_option above this isn't enough to stop the
        // refresh function from fetching every project. So fake the filter in the props
        // to the refresh call
        this.refresh(Object.assign({}, this.props, {filter: {id: default_project_id}}))
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, filter, list_key } = props

        if ( filter !== this.props.filter ) {
            dispatch(invalidateList(list_key))
        }
        if ( filter.any_field || filter.id ) {
            dispatch(fetchProjectsIfNeeded(list_key))
        }
    }

    onFieldChange(project_id, fieldOnChange) {
        const {onChange} = this.props
        fieldOnChange(project_id)
        if ( onChange ) {
            onChange(project_id)
        }
    }

    onFilterChanged(new_filter_value) {
        const { dispatch, filter, list_key, default_project_id } = this.props
        if ( new_filter_value.length >= 3 ) {
            dispatch(clear_list_filter_option(list_key, 'id'))
            dispatch(update_list_filter(list_key, {any_field: new_filter_value}))
        } else {
            dispatch(clear_list_filter_option(list_key, 'any_field'))
            if ( filter.id !== default_project_id ) {
                dispatch(update_list_filter(list_key, {id: default_project_id}))
            }
        }
    }
    
    renderSingleValueSelector(field) {
        const { auto_focus, project_id } = this.props
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(project_id) => this.onFieldChange(project_id, input.onChange)}
                placeholder={"Type to filter project"}
                value={input.value}
                options={data}
                rememberer_key={"project_"+project_id}
                auto_focus={auto_focus}
                onFilterChanged={this.onFilterChanged}
                {...rest}
            />
        )
    }
    
    render() {
        const { project_options } = this.props
        return (
            <Field name="project_id"
                   component={this.renderSingleValueSelector}
                   valueField="value"
                   textField="label"
                   data={project_options}
            />
        )
    }
}

function mapStateToProps(state, props) {
    const { item_list } = state
    const { onChange, auto_focus, default_project_id } = props
    const list_key = SELECTOR__PROJECTS
    const l = (item_list && item_list[list_key]) || {}
    const project_ids = l.visible_item_ids || []
    const projects = getProjects(state, project_ids)
    
    let project_options = projects.map(function(project) {
        let label = project.name
	return { value: project.id, label: label }
    })
    const filter = getListFilter(state, list_key)
    return {
        onChange: onChange,
        projects: projects,
        project_ids: project_ids,
        project_options: project_options,
        auto_focus,
        filter,
        default_project_id,
        list_key
    }
}

export default connect(mapStateToProps)(ProjectSelectorField)

