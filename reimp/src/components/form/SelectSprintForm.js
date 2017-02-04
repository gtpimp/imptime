import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import SelectList from 'react-widgets/lib/SelectList'
import { getSprints, fetchSprintsIfNeeded } from '../../actions/Sprints'
import {
    SELECTOR__SPRINTS
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter,
    invalidateList
} from '../../actions/ItemList'

class SelectSprintForm extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        if ( new_props.project_id != this.props.project_id ) {
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
    
    renderSelectList({input, ...rest }) {
        return (
            <SelectList {...input} onBlur={() => input.onBlur()} {...rest}/>
        )
    }
    
    render() {
        const { initialValues, handleSubmit, sprint_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="assigned">Move to sprint</label>
                    <Field name="sprint_id" component={this.renderSelectList}
                           valueField="value"
                           textField="label"
                           data={sprint_options}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {
    const { item_list } = state
    const { project_id, onChange } = props
    const l = (item_list && item_list[SELECTOR__SPRINTS]) || {}
    const sprint_ids = l.visible_item_ids || []
    const sprints = getSprints(state, sprint_ids)
    
    const sprint_options = sprints.map(function(sprint) {
	return { value: sprint.id, label: sprint.name }
    })
    
    return {
        initialValues: {sprint_id:props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange,
        sprints: sprints,
        sprint_ids: sprint_ids,
        sprint_options: sprint_options
    }
}

export default connect(mapStateToProps)(reduxForm({form:'select_sprint_form'})(SelectSprintForm))

