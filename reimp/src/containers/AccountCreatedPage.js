import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { PAGE_KEY__AUTH_PAGE } from '../actions/ItemListKeyRegistry'
import { sendOtpEmail } from '../actions/Auth'
import {
    set_toolbars,
} from '../actions/Page'

class AccountCreatedPage extends Component {
    
    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__AUTH_PAGE, []))
    }

    onSendOtpEmail = () => {
        const { dispatch, username } = this.props
        // username currently undefined. to get username from state/props
        dispatch(sendOtpEmail(username))
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
                  <button onClick={this.onSendOtpEmail}
                          className="button button--large button--login">
                    Resend Email
                  </button>
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

export default withRouter(connect(mapStateToProps)(AccountCreatedPage))
