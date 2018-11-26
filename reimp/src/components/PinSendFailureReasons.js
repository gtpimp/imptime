import React, { Component } from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PinSendFailureReasons extends Component {

    render() {
        const { email } = this.props
        
        return (
            <div>
              <div>
                Reasons why you may not have recieved a pin:
              </div>
              <div>
                {`- There may be no account registered to ${email};`}
              </div>
              <div>
                You might not have registered a phone with this account,
              </div>
              <div>
                There may be a network error, try resending.
              </div>
            </div>
        )
    }
}

export default PinSendFailureReasons

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

const login_form = css`
padding: 18px;
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
