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
            <div className="blank-page">
              <div className="blank-page__header">
                <div className="blank-page__logo"></div>
                <div className="blank-page__title">Password changed</div>
              </div>
              <div className="blank-container">
                <div className="blank-text">
                  Your password has been changed
                </div>
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
