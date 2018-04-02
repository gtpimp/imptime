import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { PAGE_KEY__AUTH_PAGE } from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
} from '../actions/Page'

class AccountCreatedPage extends Component {

    constructor(props) {
        super(props)
        this.onClickedHome = this.onClickedHome.bind(this)
    }
    
    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__AUTH_PAGE, []))
    }

    onClickedHome() {
        const { history } = this.props
        history.push('/projects');
    }
    
    render() {
        return (
            <div className="blank-page">
              <div className="blank-page__header">
                <div className="blank-page__logo"></div>
                <div className="blank-page__title">Account created</div>
              </div>
              <div className="blank-container">
                <div className="blank-text">
                  Your account has been created.
                  <br/><br/>
                  Please check your emails and click the link to login and set your password.
                  <br/><br/><br/>
                  <button onClick={this.onClickedHome} className="button button--large button--login">Home</button>
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

export default connect(mapStateToProps)(withRouter(AccountCreatedPage))
