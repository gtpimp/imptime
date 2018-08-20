import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import SingleValueSelector from './SingleValueSelector'
import MultiValueSelector from './MultiValueSelector'

class IssueStatusForm extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.renderMultiValueSelector = this.renderMultiValueSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }

    refresh() {
        const { dispatch, project_id } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
    }

    onChangeAndSubmit(e, fieldOnChange) {
        const {handleSubmit} = this.props
        fieldOnChange(e)
        setTimeout(() => handleSubmit(), 0)
    }

    renderSingleValueSelector(field) {
        const { project_id } = this.props
        const {input, data, ...rest} = field
        return (
            <SingleValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                rememberer_key={"issue_status_"+project_id}
                {...rest}
            />
        )
    }

    renderMultiValueSelector(field) {
        const { project_id } = this.props
        const {input, data, ...rest} = field
        return (
            <MultiValueSelector
                onChange={(e) => this.onChangeAndSubmit(e, input.onChange)}
                value={input.value}
                options={data}
                rememberer_key={"issue_statuses_"+project_id}
                {...rest}
            />
        )
    }    

    render() {
        const { handleSubmit, status_options, allow_multiselection } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="status">Status</label>
                  { ! allow_multiselection && 
                    <Field name="issue_status_name"
                           component={this.renderSingleValueSelector}
                           valueField="value"
                           textField="label"
                           data={status_options}
                    />
                  }
                  { allow_multiselection && 
                    <Field name="issue_status_names"
                           component={this.renderMultiValueSelector}
                           valueField="value"
                           textField="label"
                           data={status_options}
                    />
                  }
                </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onSubmitted, allow_multiselection } = props
    const project = getProject(state, project_id) || {}
    const status_names = project.allowed_issue_status_names || []
    const status_options = status_names.map(function(status_name) {
	return { value: status_name, label: status_name }
    })

    return {
        initialValues: {issue_status_name: props.initial_value,
                        issue_status_names: props.initial_value},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        status_options: status_options,
        project_id: project_id,
        project: project,
        allow_multiselection: allow_multiselection === true
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_status_form'})(IssueStatusForm))
