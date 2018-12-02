import React, { Component } from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import { withRouter } from 'react-router-dom'
import PageTitle from './PageTitle'

class PinSendFailureReasons extends Component {

    render() {
        const { history, match } = this.props
        console.log(this.props)
        return (
            <div className={ main }>
              <div className={ box }>
                <div className={ header }>
                  <PageTitle>One Time Pin</PageTitle>
                </div>
                <div className={body}>
                  <div className={text_section_1}>
                    Reasons why you may not have recieved a pin:
                  </div>
                  <div className={text_section_1}>
                    {`There may be no account registered to ${match.params.email}`}
                  </div>
                  <div className={text_section_1}>
                    You might not have registered a phone with this account,
                  </div>
                  <div className={text_section_1}>
                    There may be a network error, try resending.
                  </div>
                </div>
                <div className={ link_container }>
                  <a className={link}
                     onClick={history.goBack}>
                    Back
                  </a>
                </div>
              </div>
            </div>
        )
    }
}

export default withRouter(PinSendFailureReasons)

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

const body = css`
padding: 18px;
`

const text_section_1 = css`
padding: 5px 0px 5px 0px;
`

const link_container = css`
display: flex;
flex: 1;
justify-content: center;
align-items: center;
border-top: 1px solid #e0e0e0;
padding: 18px;
`

const link = css`
font: ${theme.fonts.regular_large};
color: ${theme.colours.list_text};
text-decoration: underline;
`
