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
            this.refresh()
        }
    }
    
    refresh() {
        const { dispatch, project_id } = this.props
        dispatch(initList(SELECTOR__SPRINTS))
        dispatch(update_list_filter(SELECTOR__SPRINTS, {project_id: project_id}))
        dispatch(invalidateList(SELECTOR__SPRINTS))
        dispatch(fetchSprintsIfNeeded(SELECTOR__SPRINTS))
    }

    renderSingleValueSelector(field) {
        const { auto_focus } = this.props
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(sprint_id) => this.onFieldChange(sprint_id, input.onChange)}
                value={input.value}
                options={data}
                auto_focus={auto_focus}
                {...rest}
            />
        )
    }
    
    render() {
        const { handleSubmit, sprint_options } = this.props
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
    const l = (item_list && item_list[SELECTOR__SPRINTS]) || {}
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
    
    return {
        onChange: onChange,
        sprints: sprints,
        sprint_ids: sprint_ids,
        sprint_options: sprint_options,
        project_id,
        auto_focus
    }
}

export default connect(mapStateToProps)(SprintSelectorField)

