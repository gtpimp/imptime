import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import '../../sass/toolbar-panel.css'
import { PAGE_KEY__COMPANIES_PAGE } from '../../actions/ItemListKeyRegistry'
import { startCandidateCompany } from '../../actions/Companies'

class CompaniesToolbarPanel extends Component {

    onNewCompanyClick = () => {
        const { dispatch} = this.props
        dispatch(startCandidateCompany())
    }
    
    render() {
        return (
            <div className="toolbar-panel">
              <div className="button toolbar-button--small button--large button--primary"
                   onClick={this.onNewCompanyClick}>
                + New Company
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const page = state.page || {}
    const selected_company_ids = (page[PAGE_KEY__COMPANIES_PAGE] || {}).company_ids || []
    const company_id = (selected_company_ids.length > 0 && selected_company_ids[0])
    
    return {
        company_id
    }
}

export default withRouter(connect(mapStateToProps)(CompaniesToolbarPanel))
