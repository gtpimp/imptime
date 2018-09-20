import React, {Component} from 'react'
import {connect} from 'react-redux'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import add_icon from '../images/icon_add.svg'

const new_tag_container = css`
display: flex;
flex-direction: row;

& p {
display: flex;
margin: 0;
align-items: center;
padding-left: ${theme.spacing.two};
font: ${theme.fonts.semibold_normal};
color: ${theme.colours.link};
}
`

const icon_add = css`
display: inline-block;
height: 18px;
width: 18px;
-webkit-mask: url(${add_icon}) no-repeat center;
mask: url(${add_icon}) no-repeat center;
background-color: ${theme.colours.list_text};
background-size: ${theme.spacing.three};
`

class SidebarAddButton extends Component {
    render() {
        const { label } = this.props

        return (
            <div className={new_tag_container}>
              <div className={icon_add} data-tooltip={label}></div>
              <p key="newbuttonlabel">{ label }</p>
            </div>
        )
    }
}
export default SidebarAddButton
