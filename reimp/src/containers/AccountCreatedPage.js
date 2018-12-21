import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'
import {withRouter} from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import PageParagraph from '../components/PageParagraph'
import { PAGE_KEY__AUTH_PAGE } from '../actions/ItemListKeyRegistry'
import { sendOtpEmail } from '../actions/Auth'
import {
    set_toolbars,
} from '../actions/Page'
import { default_theme as theme } from '../theme/default'

class AccountCreatedPage extends Component {
    
    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__AUTH_PAGE, []))
    }

    onSendOtpEmail = () => {
        const { dispatch, username } = this.props        
        dispatch(sendOtpEmail(username))
    }

    /* <div className="blank-page">
     * <div className="blank-page__header">
     * <div className="blank-page__logo"></div>
     * <div className="blank-page__title">Account created</div>
     * </div>
     * <div className="blank-container">
     * <div className="blank-text">
     * Your account has been created.
     *            <br/><br/>
     * Please check your emails and click the link to login and set your password.
     *                                                         <br/><br/><br/>
     * <button onClick={this.onSendOtpEmail}
     * className="button button--large button--login">
     * Resend Email
     * </button>
     * </div>
     * </div>
     * </div>*/
    
    render() {
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>Sign in to ImpTime</PageTitle>
                  <PageParagraph>
                    Please check your emails and click the link to login and set your password.
                  </PageParagraph>
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

const main = css`
display: flex;
justify-content: center;
padding-top: 50px;

@media (max-width: ${theme.breakpoints.mobile}) {
    padding-top: 0;
    justify-content: flex-start;
}
`

const box = css`
width: 400px;
background-color: #FFFFFF;
box-shadow: 0 4px 12px 0 rgba(0,0,0,0.3);
border-radius: 2px;

@media (max-width: ${theme.breakpoints.mobile}) {
    width: 100%;
    height: 100%;
    box-shadow: none;
    border-radius: 0;
    border: none;
    position: absolute;
    left: 0;
    top: 0;
}
`

const header = css`
border-bottom: 1px solid #e0e0e0;
padding: 18px;
`
