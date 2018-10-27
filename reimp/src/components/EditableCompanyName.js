import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import CompanyNameForm from './form/CompanyNameForm'
import { updateCompanyName, getCompany } from '../actions/Companies'
import { has_permission } from '../actions/Users'

class EditableCompanyName extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(new_value) {
        const { dispatch, company } = this.props
        dispatch(updateCompanyName(company.id, new_value.decision))
    }

    render() {
        const { company, can_edit } = this.props

        return (
            <EditableProperty property_key={'company_decision'+company.id}
                              initial_value={company.decision}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              edit_as_modal={false}
                              actionLabel="Edit Decision Journal Decision"
            >
              <CompanyNameForm />
              <div className="text-component--readonly text-component--description">{company.decision}</div>
              <div className="text-component--empty">Decision</div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { company_id } = props
    const company = getCompany(state, company_id) || {}
    const can_edit = has_permission(state, company.project_id, 'has_edit_company_info')
    return {
        company: company,
        can_edit
    }
}


export default connect(mapStateToProps)(EditableCompanyName)
