import React, {Component} from 'react'
import { css } from 'emotion'
import { Link } from 'react-router-dom'

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

    onClick = (evt) => {
        const { disabled, onButtonClick } = this.props
        if ( disabled ) {
            evt.preventDefault()
        } else if ( onButtonClick ) {
            evt.preventDefault()
            onButtonClick(evt)
        }
    }

    renderLink = () => {
        const { to, label } = this.props
        return (
            <Link
                className={btn}
                onClick={this.onClick}
                to={ to }
                {...this.props} >
              { label }
            </Link>
        )
    }

    renderButton = () => {
        const { label } = this.props
        return (
            <button
                onClick={this.onClick}
                className={btn}>
              { label }
            </button>
        )
    }
    
    render() {
        const { to } = this.props
        return to ? this.renderLink() : this.renderButton()
    }
}
export default PrimaryButton
