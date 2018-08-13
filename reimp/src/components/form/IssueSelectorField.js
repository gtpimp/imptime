import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field } from 'redux-form'
import { getIssues, fetchIssuesIfNeeded } from '../../actions/Issues'
import {
    SELECTOR__ISSUES
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_pagination,
    update_list_filter,
    clear_list_filter_option,
    invalidateList,
    getListFilter
} from '../../actions/ItemList'
import SingleValueSelector from './SingleValueSelector'

class SelectIssueField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onFilterChanged = this.onFilterChanged.bind(this)
    }
    
    componentDidMount() {
        const { list_key, dispatch } = this.props
        dispatch(initList(list_key))
        dispatch(update_list_pagination({page_size:30}))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }
    
    refresh(these_props) {
        const props = these_props || this.props
        const { dispatch, project_id, sprint_id, filter, list_key } = props
        if ( filter.project_id !== project_id ) {
            if ( project_id ) {
                dispatch(update_list_filter(list_key, {project_id: project_id}))
            } else {
                dispatch(clear_list_filter_option(list_key, 'project_id'))
            }
        }
        if ( filter.sprint_id !== sprint_id ) {
            if ( sprint_id ) {
                dispatch(update_list_filter(list_key, {sprint_id: sprint_id}))
            } else {
                dispatch(clear_list_filter_option(list_key, 'sprint_id'))
            }
        }
        if ( filter !== this.props.filter ) {
            dispatch(invalidateList(list_key))
        }
        
        if ( filter.any_field || filter.project_id || filter.sprint_id ) {
            dispatch(fetchIssuesIfNeeded(list_key))
        }
    }

    onFieldChange(issue_id, fieldOnChange) {
        const {onChange} = this.props
        fieldOnChange(issue_id)
        if ( onChange ) {
            onChange(issue_id)
        }
    }

    onFilterChanged(new_filter_value) {
        const { dispatch, filter, list_key, default_issue_id } = this.props
        if ( new_filter_value.length >= 3 ) {
            dispatch(clear_list_filter_option(list_key, 'id'))
            dispatch(update_list_filter(list_key, {any_field: new_filter_value}))
        } else {
            dispatch(clear_list_filter_option(list_key, 'any_field'))
            if ( filter.id !== default_issue_id ) {
                dispatch(update_list_filter(list_key, {id: default_issue_id}))
            }
        }
    }
    
    renderSingleValueSelector(field) {
        const { auto_focus, project_id } = this.props
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(issue_id) => this.onFieldChange(issue_id, input.onChange)}
                placeholder={"Type to filter issues"}
                value={input.value}
                options={data}
                rememberer_key={"issue_"+project_id}
                auto_focus={auto_focus}
                onFilterChanged={this.onFilterChanged}
                {...rest}
            />
        )
    }
    
    render() {
        const { issue_options } = this.props
        return (
            <Field name="issue_id"
                   component={this.renderSingleValueSelector}
                   valueField="value"
                   textField="label"
                   data={issue_options}
            />
        )
    }
}

function mapStateToProps(state, props) {
    const { item_list } = state
    const { onChange, project_id, sprint_id, auto_focus } = props
    const list_key = SELECTOR__ISSUES
    const l = (item_list && item_list[list_key]) || {}
    const issue_ids = l.visible_item_ids || []
    const issues = getIssues(state, issue_ids)
    const filter = getListFilter(state, list_key)
    
    let issue_options = issues.map(function(issue) {
        let label = "#" + issue.number + " " + issue.subject
        return { value: issue.id, label: label }
    })
    
    return {
        onChange: onChange,
        issues: issues,
        issue_ids: issue_ids,
        issue_options: issue_options,
        list_key,
        filter,
        sprint_id,
        project_id,
        auto_focus
    }
}

export default connect(mapStateToProps)(SelectIssueField)

