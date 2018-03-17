import React, {Component} from 'react'
import {connect} from 'react-redux'
import { PAGE_KEY__AUTH_PAGE } from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
} from '../actions/Page'

class PasswordChangedPage extends Component {

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__AUTH_PAGE, []))
    }
    
    render() {
        return (
            <div className="login-page">
              <div className="login-container">
                <div>Password changed</div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
        settings: state.settings
    }
}

export default connect(mapStateToProps)(PasswordChangedPage)
