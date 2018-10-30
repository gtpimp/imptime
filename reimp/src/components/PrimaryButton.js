import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'

const btn = css`
height: 32px;
border: none;
border: none;
background: transparent;
background-color: ${theme.colours.sidebar_button_background};
outline: none;
font: ${theme.fonts.semibold_normal};
color: ${theme.colours.link};

&:hover {
color: ${theme.colours.strong_text};
background-color: ${theme.colours.button_hover_background};
cursor: pointer;
}
`

class PrimaryButton extends Component {
    render() {
        const { label, onButtonClick } = this.props
        return (
            <button onClick={ onButtonClick } className={btn}>
              { label }
            </button>
        )
    }
}
export default PrimaryButton
