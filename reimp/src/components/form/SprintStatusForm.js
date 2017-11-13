import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import SingleValueSelector from './SingleValueSelector'

class SprintStatusForm extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
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
        const { handleSubmit, status_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
            <div>
            <label htmlFor="status">Status</label>
            <Field name="sprint_status_name"
            component={this.renderSingleValueSelector}
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

    const { project_id, onSubmitted } = props
    const project = getProject(state, project_id) || {}
    const status_names = project.allowed_sprint_status_names || []
    const status_options = status_names.map(function(status_name) {
	return { value: status_name, label: status_name }
    })
    
    return {
        initialValues: {},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        status_options: status_options,
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(reduxForm({form:'sprint_status_form'})(SprintStatusForm))
