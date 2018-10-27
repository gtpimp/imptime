import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropertyStack from './PropertyStack'
import Sidebar from './Sidebar'
import {
    getCandidateCompany,
    updateCandidateName,
    saveCandidateCompany,
    cancelCandidateCompany
} from '../actions/Companies'
import CompanyNameForm from './form/CompanyNameForm'

class NewCompanySidebar extends Component {

    onSaveCandidateCompany = (new_value) => {
        const {dispatch} = this.props
        dispatch(updateCandidateName(new_value.name))
        dispatch(saveCandidateCompany())
    }

    onCancelCompanyCreation = () => {
        const {dispatch} = this.props
        dispatch(cancelCandidateCompany())
    }
    
    render() {
        
        return (
            
            <Sidebar>
              <PropertyStack>
                <div>
                  <div>
                    <CompanyNameForm
                        onSubmitted={this.onSaveCandidateCompany}
                        onCancel={this.onCancelCompanyCreation}/>
                  </div>
                </div>
              </PropertyStack>
            </Sidebar>
        )
    }
}

function mapStateToProps(state, props) {

    const candidate_company = getCandidateCompany(state) || null
    return {
        candidate_company: candidate_company
    }
}

export default connect(mapStateToProps)(NewCompanySidebar)
