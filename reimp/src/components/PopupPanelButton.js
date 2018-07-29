import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanelButton extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={css`color: ${theme.colours.strong_text};
                                //background-color: ${theme.colours.button_background};
                                font: ${theme.fonts.regular_large};
                                padding-top: 12px;
                                text-transform: none;
                                padding-left: 12px;
                                text-align: center;
                                height: 36px;
                                display: flex;
                                justify-content: center;
                                flex-direction: column;
                                cursor: default;
                                &:hover: {
                                    cursor: 'pointer';
                                }`}>
                 {children}
            </div>
        )
    }
    
}

export default PopupPanelButton

