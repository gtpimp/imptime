import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class DivTableRow extends Component {

    render() {

        const { divkey, is_selected, onClick } = this.props

        const action = onClick || null
        
        return (
            <div className={css`background-color: ${is_selected ? theme.colours.list_selected : "inherit"};
                                top: 36px;
                                display: flex;
                                z-index:9;
                                &:hover {
                                    background-color: ${is_selected ? theme.colours.list_selected_rollover : theme.colours.list_rollover};
                                }
                                flex-direction: row;
                                min-height: 40px;
                                font: theme.fonts.list_items;
                                padding-left: 24px;
                            `}
                 onClick={action}
                 key={divkey}>
                 {this.props.children}
            </div>
        )
    }
    
}

export default DivTableRow

