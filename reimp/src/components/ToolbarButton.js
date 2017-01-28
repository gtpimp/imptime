import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import '../sass/toolbar-button.css'

class ToolbarButton extends Component {

    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        console.log('click')
    }

    render() {
        const {style} = this.props
        return (
            <div className={classNames('toolbar-button', 'toolbar-button--' + style, {
                'toolbar-button--enabled': style === 'toggle' && this.props.isEnabled,
                'toolbar-button--disabled': style === 'toggle' && !this.props.isEnabled
            })}
                 onClick={this.onClick()}>
                { this.props.icon &&
                <div className="toolbar-button__icon"><i className="material-icons">{this.props.icon}</i></div>
                }
                { !this.props.icon &&
                <div className="toolbar-button__content">
                    { this.props.children}
                </div>
                }
            </div>

        )
    }
}

function mapStateToProps(state, props) {

    return {
        style: props.style || 'default'
    }
}


export default connect(mapStateToProps)(ToolbarButton)
