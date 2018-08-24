import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanelMiniButton extends Component {

    render() {
        const { children, active, onClick } = this.props

        const action = onClick || function() {}
        
        return (
            <div className={css`color: ${theme.colours.strong_text};
                                background-color: ${theme.colours.button_background};
                                font: ${theme.fonts.regular_large};
                                font-weight: ${active ? "bold" : "normal"};
                                text-transform: none;
                                padding-left: ${theme.spacing.horizontal_text_space_inside_button};
                                padding-right: ${theme.spacing.horizontal_text_space_inside_button};
                                margin-top: ${theme.spacing.vertical_row_space_tight};
                                margin-left: ${theme.spacing.horizontal_space_inline};
                                margin-bottom: ${theme.spacing.vertical_row_space_tight};
                                margin-right: ${theme.spacing.horizontal_space_inline};
                                text-align: center;
                                display: flex;
                                height:24px;
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

export default PopupPanelMiniButton

