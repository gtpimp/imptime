import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keyBy } from 'lodash'
import { Field } from 'redux-form'
import { getIssues, fetchIssuesIfNeeded } from '../../actions/Issues'
import {
    SELECTOR__ISSUE_GROUPS
} from '../../actions/ItemListKeyRegistry'
import {
    initList,
    update_list_filter,
    invalidateList
} from '../../actions/ItemList'
import SingleValueSelector from './SingleValueSelector'

class SelectIssueParentGroupField extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
    }
    
    componentDidMount() {
        this.refresh()
    }

    onFieldChange(issue_id, fieldOnChange) {
        const {onChange, issues} = this.props
        const issue = keyBy(issues, "id")[issue_id]
        fieldOnChange(issue_id)
        if ( onChange ) {
            onChange(issue)
        }
    }
    
    componentWillReceiveProps(new_props) {
        if ( new_props.project_id !== this.props.project_id ) {
            this.refresh()
        }
    }
    
    refresh() {
        const { dispatch, project_id } = this.props
        dispatch(initList(SELECTOR__ISSUE_GROUPS))
        dispatch(update_list_filter(SELECTOR__ISSUE_GROUPS, {project_id: project_id,
                                                             can_group_issues: true}))
        dispatch(invalidateList(SELECTOR__ISSUE_GROUPS))
        dispatch(fetchIssuesIfNeeded(SELECTOR__ISSUE_GROUPS))
    }

    renderSingleValueSelector(field) {
        const { auto_focus, project_id } = this.props
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(issue_id) => this.onFieldChange(issue_id, input.onChange)}
                placeholder={"Type to filter feature issues"}
                value={input.value}
                options={data}
                rememberer_key={"issue_"+project_id}
                auto_focus={auto_focus}
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
    const { onChange, project_id, auto_focus } = props
    const l = (item_list && item_list[SELECTOR__ISSUE_GROUPS]) || {}
    const issue_ids = l.visible_item_ids || []
    const issues = getIssues(state, issue_ids)
    
    let issue_options = issues.map(function(issue) {
        let label = "#" + issue.number + " " + issue.subject
        return { value: issue.id, label: label }
    })
    
    return {
        onChange: onChange,
        issues: issues,
        issue_ids: issue_ids,
        issue_options: issue_options,
        project_id,
        auto_focus
    }
}

export default connect(mapStateToProps)(SelectIssueParentGroupField)

