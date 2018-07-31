import React, {Component} from 'react'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'

class DivTableHeaderRow extends Component {

    render() {
        return (
            <div className={css`display: flex;
                                flex-direction: row;
                                font: ${theme.fonts.list_items};
                                height: 40px;
                                margin-top: 24px;
                                padding-left: 24px;
                            `}>
                 {this.props.children}
            </div>
        )
    }
}

export default DivTableHeaderRow

