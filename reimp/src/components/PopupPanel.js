import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class PopupPanel extends Component {

    render() {
        const { children } = this.props
        return (
            <div className={css`z-index:9;
                            -webkit-box-shadow: 13px 14px 14px -10px rgba(0,0,0,0.39);
                            -moz-box-shadow: 13px 14px 14px -10px rgba(0,0,0,0.39);
                            box-shadow: 13px 14px 14px -10px rgba(0,0,0,0.39);
                            color: ${theme.colours.strong_text};
                            padding: 24px;
                            height: 100%;
                            min-width: 290px;
                            flex-direction: column;
                            background-color: ${theme.colours.panel_background};
                            `}
            >
              {children}
            </div>
        )
    }
    
}

export default PopupPanel

