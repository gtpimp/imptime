import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

class PasswordReminderSentPage extends Component {

    constructor(props) {
        super(props)
        this.onClickedHome = this.onClickedHome.bind(this)
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
                <div className="blank-page__title">Password reset</div>
              </div>
              <div className="blank-container">
                <div className="blank-text">
                  If that was a valid username, then you have been sent a password reset email.
                  <br/><br/><br/>
                  Check your email for the link to reset it.
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
    }
}

export default withRouter(connect(mapStateToProps)(PasswordReminderSentPage))
