import React, {Component} from 'react'
import { css, cx } from 'emotion'

import { default_theme as theme } from '../theme/default'

const icon_button = css`
display: flex;
flex: 1;
height: 40px;
border: none;
justify-content: center;
align-items: center;
background: transparent;
cursor: pointer;
padding-right: ${theme.spacing.two};
outline: none;
font: ${theme.fonts.semibold_normal};
color: ${theme.colours.link};
max-width: 130px;

&:hover {
color: ${theme.colours.strong_text};

div:first-child {
background-color: ${theme.colours.strong_text};
}
}

`

const button_label = css`
display: flex;
justify-content: center;
`

const icon_add = css`
display: flex;
justify-content: center;
height: 32px;
width: 32px;
background-color: ${theme.colours.list_text};
background-size: ${theme.spacing.three};
`

class IconButton extends Component {
    render() {
        const { icon, label, onButtonClick } = this.props

        if (! onButtonClick ) {
            return (
                <div className={icon_button}>
                  <div className={cx(icon_add, css`
                  -webkit-mask: url(${icon}) no-repeat center;
                  `)} data-tooltip={label}></div>
                  <div className={button_label}>{ label }</div>
                </div>
            )
        }
        
        return (
            <button onClick={ onButtonClick } className={icon_button}>
              <div className={cx(icon_add, css`
                  -webkit-mask: url(${icon}) no-repeat center;
                  `)} data-tooltip={label}></div>
              <div className={button_label}>{ label }</div>
            </button>
        )
    }
}
export default IconButton
