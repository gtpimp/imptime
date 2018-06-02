import React, {Component} from 'react'
import {connect} from 'react-redux'
import { concat, partition, sortBy, keyBy } from 'lodash'
import { Field } from 'redux-form'
import { getProjects, fetchProjectsIfNeeded } from '../../actions/Projects'
import {
    SELECTOR__PROJECTS
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter,
    getListFilter
} from '../../actions/ItemList'
import SingleValueSelector from './SingleValueSelector'

class ProjectSelectorField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    onFieldChange(project_id, fieldOnChange) {
        const {onChange, projects} = this.props
        const project = keyBy(projects, "id")[project_id]
        fieldOnChange(project_id)
        if ( onChange ) {
            onChange(project_id)
        }
    }
    
    componentWillReceiveProps(new_props) {
        if ( new_props.project_id !== this.props.project_id ) {
            this.refresh()
        }
    }
    
    refresh() {
        const { dispatch, project_id, filter } = this.props
        dispatch(initList(SELECTOR__PROJECTS))
        if ( filter.project_id !== project_id ) {
            dispatch(update_list_filter(SELECTOR__PROJECTS, {project_id: project_id}))
        }
        dispatch(fetchProjectsIfNeeded(SELECTOR__PROJECTS))
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
    const { onChange, project_id, auto_focus } = props
    const l = (item_list && item_list[SELECTOR__PROJECTS]) || {}
    const project_ids = l.visible_item_ids || []
    const projects = getProjects(state, project_ids)
    
    let project_options = projects.map(function(project) {
        let label = project.name
	return { value: project.id, label: label }
    })
    const filter = getListFilter(state, SELECTOR__PROJECTS)
    return {
        onChange: onChange,
        projects: projects,
        project_ids: project_ids,
        project_options: project_options,
        auto_focus,
        filter
    }
}

export default connect(mapStateToProps)(ProjectSelectorField)

