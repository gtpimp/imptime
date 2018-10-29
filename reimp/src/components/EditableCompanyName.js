import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import CompanyNameForm from './form/CompanyNameForm'
import PermissionInspectorHighlighter from './PermissionInspectorHighlighter'
import { updateCompanyName, getCompany } from '../actions/Companies'
import { has_company_permission } from '../actions/Users'

class EditableCompanyName extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, company } = this.props
        dispatch(updateCompanyName(company.id, new_value.name))
    }

    render() {
        const { company, can_edit } = this.props

        return (
            <PermissionInspectorHighlighter project_id={company.project_id}
                                            permission_name='has_edit_company_info'>
              <EditableProperty property_key={'company_name'+company.id}
                                initial_value={company.name}
                                onChange={this.onChange}
                                can_edit={can_edit}
                                edit_as_modal={false}
                                actionLabel="Edit Company Name"
              >
                <CompanyNameForm />
                <div className="text-component--readonly">{company.name}</div>
                <div className="text-component--empty">Name</div>
              </EditableProperty>
            </PermissionInspectorHighlighter>
        )
    }
}

function mapStateToProps(state, props) {
    const { company_id } = props
    const company = getCompany(state, company_id) || {}

    const can_edit = has_company_permission(state, company_id, 'has_edit_company_info')
    return {
        company: company,
        can_edit
    }
}


export default connect(mapStateToProps)(EditableCompanyName)
