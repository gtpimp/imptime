import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import settings_icon from '../images/icon_settings.svg'

const new_tag_container = css`
display: flex;
flex-direction: row;
cursor: pointer;
padding: ${theme.spacing.one} 0 ${theme.spacing.one} 0;

& p {
display: flex;
margin: 0;
align-items: center;
padding-left: ${theme.spacing.two};
font: ${theme.fonts.semibold_normal};
color: ${theme.colours.link};
}
`

const icon = css`
display: inline-block;
height: 18px;
width: 18px;
-webkit-mask: url(${settings_icon}) no-repeat center;
mask: url(${settings_icon}) no-repeat center;
background-color: ${theme.colours.list_text};
background-size: ${theme.spacing.three};
`

class SidebarManageButton extends Component {

    renderClickableButton = () => {
        const { label, onButtonClick } = this.props
        return (
            <div onClick={ onButtonClick } className={new_tag_container}>
              <div className={icon} data-tooltip={label}></div>
              <p key="managebuttonlabel">{ label }</p>
            </div>
        )
    }

    render() {
        const { label, onButtonClick } = this.props

        if (onButtonClick) {
            return this.renderClickableButton()
        }

        return (
            <div className={new_tag_container}>
              <div className={icon} data-tooltip={label}></div>
              <p key="managebuttonlabel">{ label }</p>
            </div>
        )
    }
}
export default SidebarManageButton
