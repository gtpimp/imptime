import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {
    LIST_KEY__COMPANY_PROBLEM_LIST,
    PAGE_KEY__COMPANY_PROBLEM_PAGE,
    COMPANY_PROBLEM_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
} from '../actions/Page'
import CompanyProblemList from '../components/CompanyProblemList'

class CompanyProblemPage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__COMPANY_PROBLEM_PAGE, ['company_problem']))
    }
            
    render() {
        const { company_problem_header_list } = this.props
        
        return (
            <div className="list-layout">
              <CompanyProblemList list_key={LIST_KEY__COMPANY_PROBLEM_LIST}
                                  header_list={company_problem_header_list} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const company_problem_header_list = COMPANY_PROBLEM_HEADER_LIST
    
    return {
        company_problem_header_list
    }
}

export default withRouter(connect(mapStateToProps)(CompanyProblemPage))

