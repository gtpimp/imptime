import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {
    LIST_KEY__COMPANY_PROBLEM_LIST,
    PAGE_KEY__COMPANY_PROBLEM_PAGE
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
        return (
            <div className="list-layout">
              <CompanyProblemList list_key={LIST_KEY__COMPANY_PROBLEM_LIST}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    return {
    }
}

export default withRouter(connect(mapStateToProps)(CompanyProblemPage))

