import React, {Component} from 'react'
import {connect} from 'react-redux'
import Timestamp from './Timestamp'
import SidebarContainer from './SidebarContainer'
import SidebarSectionTitle from './SidebarSectionTitle'
import moment from 'moment'
import {ensureCompaniesLoaded, getCompany, deleteCompanies} from '../actions/Companies'
import EditableCompanyName from './EditableCompanyName'

class CompanySidebar extends Component {

    componentDidMount() {
	const { dispatch, company_id } = this.props
	if ( company_id ) {
	    dispatch(ensureCompaniesLoaded([company_id]))
        }
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        const { company_id } = new_props
	if ( company_id ) {
	    dispatch(ensureCompaniesLoaded([company_id]))
	}
    }

    onDeleteCompany = () => {
        const { dispatch, company_id, company } = this.props
        if ( ! company.can_delete_company ) {
            window.alert("Can't delete this company")
            return
        }
        if (! window.confirm("Are you sure you want to delete this company?") ) {
            return false
        }
        dispatch(deleteCompanies([company_id]))
    }

    render() {

        const { company_id, company } = this.props

        if (! company_id ) {
            return null
        }
        
        return (
            <SidebarContainer>

              <div key="namestack">
                <SidebarSectionTitle title="Name" />
                <EditableCompanyName company_id={company_id} />
              </div>

              <div key="infostack">
                <SidebarSectionTitle title="Info" />
                <div className="named-property__name">Created</div>
                <div className="named-property__value"><Timestamp format="short-date" value={moment(company.created)}/></div>
                { false && <div onClick={this.onDeleteCompany} className="icon--small-delete" /> }
              </div>
              
            </SidebarContainer>
        )
    }
}

export function mapStateToProps(state, props) {
    const { company_id } = props
    const company = getCompany(state, company_id) || {}
    
    return {
        company_id,
        company
    }
}

export default connect(mapStateToProps)(CompanySidebar)

