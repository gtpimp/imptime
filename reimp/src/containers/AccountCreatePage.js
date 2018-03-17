import React, {Component} from 'react'
import {connect} from 'react-redux'
import { PAGE_KEY__AUTH_PAGE } from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
} from '../actions/Page'

class AccountCreatePage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__AUTH_PAGE, []))
    }
    
    render() {
        return (
            <div className="account-create-page">
              <div>Create new account</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
        settings: state.settings
    }
}

export default connect(mapStateToProps)(AccountCreatePage)
