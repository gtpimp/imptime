import React, {Component} from 'react'
import {connect} from 'react-redux'
import { concat, partition, sortBy } from 'lodash'
import { Field, reduxForm } from 'redux-form'
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

class SelectSprintForm extends Component {

    componentDidMount() {
        this.refresh()
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
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

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }

    renderSingleValueSelector(field) {
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                {...rest}
            />
        )
    }
    
    render() {
        const { handleSubmit, sprint_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <Field name="sprint_id"
                           component={this.renderSingleValueSelector}
                           valueField="value"
                           textField="label"
                           data={sprint_options}
                    />
                </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {
    const { item_list } = state
    const { onSubmitted, project_id } = props
    const l = (item_list && item_list[SELECTOR__SPRINTS]) || {}
    const sprint_ids = l.visible_item_ids || []
    const sprints = getSprints(state, sprint_ids)
    
    let sprint_options = sprints.map(function(sprint) {

        let label = sprint.name
        if ( ! sprint.is_open ) {
            label += " (closed) "
        }
	return { value: sprint.id, label: label, is_open: sprint.is_open }
    })
    const partitioned = partition(sprint_options, 'is_open')
    sprint_options = concat(sortBy(partitioned[0], 'label'), sortBy(partitioned[1], 'label'))
    
    return {
        initialValues: {sprint_id:props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        sprints: sprints,
        sprint_ids: sprint_ids,
        sprint_options: sprint_options,
        project_id
    }
}

export default connect(mapStateToProps)(reduxForm({form:'select_sprint_form'})(SelectSprintForm))

