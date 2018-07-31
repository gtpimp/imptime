import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { ensureProjectsLoaded, getProject } from '../../actions/Projects'
import SingleValueSelector from './SingleValueSelector'
import PopupPanelButton from '../PopupPanelButton'
import { submit } from 'redux-form'

class IssueTypeForm extends Component {

    constructor(props) {
        super(props)
        this.renderSingleValueSelector = this.renderSingleValueSelector.bind(this)
        this.onChangeAndSubmit = this.onChangeAndSubmit.bind(this)
        this.onClickSubmit = this.onClickSubmit.bind(this)
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
                rememberer_key={"issue_type_"+project_id}
                {...rest}
            />
        )
    }

    onClickSubmit() {
        const { dispatch } = this.props
        dispatch(submit('issue_type_form'))
    }

    render() {
        const { handleSubmit, type_options } = this.props
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="type">Type</label>
                    <Field name="issue_type_name"
                           component={this.renderSingleValueSelector}
                           valueField="value"
                           textField="label"
                           data={type_options}
                    />
                </div>
            </form>
        )
    }
}

function mapStateToProps(state, props) {

    const { project_id, onSubmitted } = props
    const project = getProject(state, project_id) || {}
    const type_names = project.allowed_issue_type_names || []
    const type_options = type_names.map(function(type_name) {
	return { value: type_name, label: type_name }
    })

    return {
        initialValues: {},
        enableReinitialize: true,
        onSubmit: onSubmitted,
        type_options: type_options,
        project_id: project_id,
        project: project
    }
}

export default connect(mapStateToProps)(reduxForm({form:'issue_type_form'})(IssueTypeForm))
