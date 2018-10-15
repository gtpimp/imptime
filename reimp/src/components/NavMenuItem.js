import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class NavMenuItem extends Component {

    render() {

        const { isActive, colourName, children } = this.props
        
        return (
            <div className={css`padding-left:12px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                &:hover: { cursor: pointer;}
                                cursor: pointer;
                                background-color: ${isActive === true ? theme.colours.panel_background : "auto"};
                                color: ${colourName === null ? "#ffffff" : theme.colours[colourName]}
                `}>
            {children}
            </div>
        )
    }
    
}

export default NavMenuItem
