import React, {Component} from 'react'
import {connect} from 'react-redux'
import { concat, partition, sortBy, keyBy } from 'lodash'
import { Field } from 'redux-form'
import { getSprints, fetchSprintsIfNeeded } from '../../actions/Sprints'
import {
    SELECTOR__SPRINTS
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter,
    getListFilter,
    invalidateList
} from '../../actions/ItemList'
import SingleValueSelector from './SingleValueSelector'

class SprintSelectorField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    onFieldChange(sprint_id, fieldOnChange) {
        const {onChange, sprints} = this.props
        const sprint = keyBy(sprints, "id")[sprint_id]
        fieldOnChange(sprint_id)
        if ( onChange ) {
            onChange(sprint)
        }
    }
    
    componentWillReceiveProps(new_props) {
        if ( new_props.project_id !== this.props.project_id ) {
            this.refresh(new_props)
        }
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project_id, filter, list_key } = props
        dispatch(initList(list_key))
        if ( filter.project_id !== project_id ) {
            dispatch(update_list_filter(list_key, {project_id: project_id}))
        }
        if ( filter !== this.props.filter ) {
            dispatch(invalidateList(list_key))
        }
        dispatch(fetchSprintsIfNeeded(list_key))
    }

    renderSingleValueSelector(field) {
        const { auto_focus, project_id } = this.props
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(sprint_id) => this.onFieldChange(sprint_id, input.onChange)}
                placeholder={"Type to filter sprint"}
                value={input.value}
                options={data}
                rememberer_key={"sprint_"+project_id}
                auto_focus={auto_focus}
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
    const { onChange, project_id, auto_focus } = props
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

    const filter = getListFilter(state, list_key)
    
    return {
        onChange: onChange,
        sprints: sprints,
        sprint_ids: sprint_ids,
        sprint_options: sprint_options,
        project_id,
        auto_focus,
        filter,
        list_key
    }
}

export default connect(mapStateToProps)(SprintSelectorField)
