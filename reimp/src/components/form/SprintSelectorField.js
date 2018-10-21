import React, {Component} from 'react'
import {connect} from 'react-redux'
import { concat, partition, sortBy } from 'lodash'
import { Field } from 'redux-form'
import { getSprints, fetchSprintsIfNeeded, ensureSprintsLoaded, getSprint } from '../../actions/Sprints'
import {
    SELECTOR__SPRINTS
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter,
    clear_list_filter_option,
    update_list_pagination,
    getListFilter,
    invalidateList
} from '../../actions/ItemList'
import SingleValueSelector from './SingleValueSelector'

class SprintSelectorField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onFilterChanged = this.onFilterChanged.bind(this)
    }
    
    componentDidMount() {
        const { dispatch, list_key, project_id } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_pagination({page_size:30}))
        dispatch(update_list_filter(list_key, {project_id: project_id,
                                               sprint_status: 'open'}))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project_id, filter, list_key, default_sprint_id } = props

        if ( default_sprint_id && default_sprint_id !== this.props.default_sprint_id ) {
            dispatch(ensureSprintsLoaded([default_sprint_id]))
        }
        
        if ( filter.project_id !== project_id ) {
            if ( project_id ) {
                dispatch(update_list_filter(list_key, {project_id: project_id}))
            } else {
                dispatch(clear_list_filter_option(list_key, 'project_id'))
            }
               
        }
        if ( filter !== this.props.filter ) {
            dispatch(invalidateList(list_key))
        }
        if ( filter.any_field || filter.project_id ) {
            dispatch(fetchSprintsIfNeeded(list_key))
        }
    }

    onFieldChange(sprint_id, fieldOnChange) {
        const {onChange} = this.props
        fieldOnChange(sprint_id)
        if ( onChange ) {
            onChange(sprint_id)
        }
    }
    
    onFilterChanged(new_filter_value) {
        const { dispatch, filter, list_key, default_sprint_id } = this.props
        if ( new_filter_value.length >= 3 ) {
            dispatch(clear_list_filter_option(list_key, 'id'))
            dispatch(update_list_filter(list_key, {any_field: new_filter_value}))
        } else {
            dispatch(clear_list_filter_option(list_key, 'any_field'))
            if ( filter.id !== default_sprint_id ) {
                dispatch(update_list_filter(list_key, {id: default_sprint_id}))
            }
        }
    }

    renderSingleValueSelector(field) {
        const { auto_focus, project_id, sprint_id, default_sprint_id, default_sprint } = this.props
        const {input, data, ...rest} = field
        const initial_filter_term = (!sprint_id && default_sprint_id && default_sprint.name) || null
        return (
            <SingleValueSelector
                onChange={(sprint_id) => this.onFieldChange(sprint_id, input.onChange)}
                placeholder={"Type to filter sprint"}
                initial_filter_term={initial_filter_term}
                value={input.value}
                options={data}
                rememberer_key={"sprint_"+project_id}
                auto_focus={auto_focus}
                onFilterChanged={this.onFilterChanged}
                {...rest}
            />
        )
    }
    
    render() {
        const { sprint_options } = this.props
        return (
            <Field name="sprint_id"
                   component={this.renderSingleValueSelector}
                   valueField="value"
                   textField="label"
                   data={sprint_options}
            />
        )
    }
}

function mapStateToProps(state, props) {
    const { item_list } = state
    const { onChange, project_id, auto_focus, default_sprint_id } = props
    const list_key = SELECTOR__SPRINTS
    const l = (item_list && item_list[list_key]) || {}
    const sprint_ids = l.visible_item_ids || []
    const sprints = getSprints(state, sprint_ids)
    
    let sprint_options = sprints.map(function(sprint) {

        let label = sprint.name
        if ( ! sprint.is_open ) {
            label += " (closed) "
        } else {
            label += " [" + sprint.sprint_type +"]"
        }
	return { value: sprint.id, label: label, is_open: sprint.is_open }
    })
    const partitioned = partition(sprint_options, 'is_open')
    sprint_options = concat(sortBy(partitioned[0], 'label'), sortBy(partitioned[1], 'label'))

    const default_sprint = default_sprint_id && getSprint(state, default_sprint_id)
    
    const filter = getListFilter(state, list_key)
    
    return {
        onChange: onChange,
        sprints: sprints,
        sprint_ids: sprint_ids,
        sprint_options: sprint_options,
        project_id,
        default_sprint_id,
        auto_focus,
        filter,
        list_key,
        default_sprint
    }
}

export default connect(mapStateToProps)(SprintSelectorField)
