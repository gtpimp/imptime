import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../../theme/default'

class SimplifiedButton extends Component {

    render() {
        const { children, active, onClick } = this.props

        const action = onClick || function(evt) {evt.preventDefault()}
        
        return (
            <div className={css`color: ${theme.colours.strong_text};
                                background-color: ${theme.colours.button_background};
                                font: ${theme.fonts.regular_large};
                                font-weight: ${active ? "bold" : "normal"};
                                text-transform: none;
                                padding-left: 12px;
                                margin-top: 24px;
                                text-align: center;
                                height: 36px;
                                display: flex;
                                justify-content: center;
                                flex-direction: column;
                                cursor: pointer;
                                &:hover {
                                    background-color: ${theme.colours.button_background_hover};
                                }`}
                 onClick={action}
            >
                 {children}
            </div>
        )
    }
    
}

export default SimplifiedButton

