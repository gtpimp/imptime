import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureCompaniesLoaded, getCompanies} from '../actions/Companies'
import PropertyStack from '../components/PropertyStack'
import PropertyStackComponent from '../components/PropertyStackComponent'

class MultipleCompanySidebar extends Component {

    componentDidMount() {
        const {company_ids, dispatch} = this.props
        dispatch(ensureCompaniesLoaded(company_ids))
    }

    componentWillReceiveProps(new_props) {
        const {dispatch} = this.props
        dispatch(ensureCompaniesLoaded(new_props.company_ids))
    }

    render() {

        const {companies} = this.props

        return (

            <div className="sidebar company-sidebar">
              <PropertyStack>
                <PropertyStackComponent>
                  <div className="property-row">
                    <div className="property-value">
                      { companies.length } companies selected
                    </div>
                  </div>
                  
                </PropertyStackComponent>
                
              </PropertyStack>
              
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {company_ids} = props
    const companies = getCompanies(state, company_ids) || []
    let company = null
    if ( companies && companies.length > 0 ) {
        company = companies[0]
    }
    
    return {
        companies: companies || [],
        company,
        company_ids
    }
}

export default connect(mapStateToProps)(MultipleCompanySidebar)
