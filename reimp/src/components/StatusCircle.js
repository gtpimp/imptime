import React, {Component} from 'react'
import {css} from 'emotion'

class StatusCircle extends Component {

    render() {
        const { colour } = this.props
        return (
            <div className={css`height: 16px;
                                width: 16px;
                                background-color: ${colour};
                                border-radius: 8px;
                                opacity: 0.5;`}
            />
        )
    }
}

export default StatusCircle

