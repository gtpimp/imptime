import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { Field, reduxForm } from 'redux-form'
import SelectList from 'react-widgets/lib/SelectList'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'

class IssueStatusForm extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh()
    }
    
    refresh() {
        const { dispatch, assignable_user_ids, project_id } = this.props
        dispatch(ensureProjectsLoaded([project_id]))
    }
    
    renderStatusList({input, ...rest }) {
        return (
            <SelectList {...input} onBlur={() => input.onBlur()} {...rest}/>
        )
    }
    
    render() {
        const { initialValues, handleSubmit, status_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="status">Status</label>
                    <Field name="issue_status_name" component={this.renderStatusList}
                           valueField="value"
                           textField="label"
                           data={status_options}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onChange } = props
    const project = getProject(state, project_id) || {}
    const status_names = project.allowed_status_names || []
    const status_options = status_names.map(function(status_name) {
	return { value: status_name, label: status_name }
    })
    
    return {
        initialValues: {assigned_to: props.initial_value},
        enableReinitialize: true,
        onSubmit: onChange,
        status_options: status_options,
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_status_form'})(IssueStatusForm))
