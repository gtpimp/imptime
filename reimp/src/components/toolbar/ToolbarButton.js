import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import '../../sass/toolbar-button.css'

class ToolbarButton extends Component {

    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        // TODO something like this (needs to handle cases where toggle handlers are not set
        const {flavour, onClick} = this.props
        if (onClick) {
            onClick()
        } else if (flavour === 'toggle') {
            if (this.props.isEnabled) {
                this.props.onDisable()
            } else {
                this.props.onEnable()
            }
        } else {
            console.log('click (no delegate)')
        }
    }

    render() {
        const {flavour} = this.props
        return (
            <div className={classNames('toolbar-button', 'toolbar-button--' + flavour, {
                'toolbar-button--enabled': flavour === 'toggle' && this.props.isEnabled,
                'toolbar-button--disabled': flavour === 'toggle' && !this.props.isEnabled
            })}
                 onClick={this.onClick}>
                { this.props.icon &&
                  <div className="toolbar-button__icon"><i data-tip={this.props.tooltip} className="material-icons">{this.props.icon}</i></div>
                }
                { !this.props.icon &&
                <div className="toolbar-button__content">
                    {/*{ this.props.children}*/}
                </div>
                }
            </div>

        )
    }
}

function mapStateToProps(state, props) {

    return {
        flavour: props.flavour || 'default'
    }
}


export default connect(mapStateToProps)(ToolbarButton)
