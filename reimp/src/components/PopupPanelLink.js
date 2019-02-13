import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanelLink extends Component {

    render() {
        const { children, active, onClick } = this.props
        const action = onClick || function() {}
        return (
            <div className={css`color: ${theme.colours.link};
                                font: ${theme.fonts.link};
                                font-weight: ${active ? "bold" : "normal"};
                                text-transform: none;
                                padding: 6px;
                                padding-bottom: 8px;
                                text-align: left;
                                justify-content: center;
                                cursor: pointer;
                                &:hover {
                                    font-weight: bold;
                                    cursor: 'pointer';
                                }`}
                 onClick={action}
            >
              {children}
            </div>
        )
    }
    
}

export default PopupPanelLink

