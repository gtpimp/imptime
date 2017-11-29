import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import '../../sass/toolbar-button.css'
import ToolTip from 'react-portal-tooltip'

class ToolbarButton extends Component {

    state = {
        isTooltipActive: false
    }
    
    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this)
        this.showTooltip = this.showTooltip.bind(this)
        this.hideTooltip = this.hideTooltip.bind(this)
    }

    showTooltip() {
        const { dispatch, issue, tooltips_enabled } = this.props
        if ( tooltips_enabled ) {
            this.setState({isTooltipActive: true})
        }
    }
    
    hideTooltip() {
        const { dispatch, tooltips_enabled } = this.props
        if ( tooltips_enabled ) {
            this.setState({isTooltipActive: false})
        }
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
        const { isTooltipActive } = this.state
        const that = this

        return (
            <div>
              <div ref={(el) => { this.button_el = el }}
                   className={classNames('toolbar-button', 'toolbar-button--' + flavour, {
                           'toolbar-button--enabled': flavour === 'toggle' && this.props.isEnabled,
                           'toolbar-button--disabled': flavour === 'toggle' && !this.props.isEnabled
                   })}
                   onClick={this.onClick}
                   onMouseEnter={this.showTooltip}
                   onMouseLeave={this.hideTooltip}
              >
                { this.props.icon &&
                  <div className="toolbar-button__icon">
                    <i className="material-icons">
                      {this.props.icon}
                    </i>
                  </div>
                }
                { !this.props.icon &&
                  <div className="toolbar-button__content">
                    { this.props.children}
                  </div>
                }
              </div>
              { false && this.props.tooltip &&
                <ToolTip active={isTooltipActive}
                         position="right"
                         arrow="center"
                         parent={this.button_el}>
                  {this.props.tooltip}
                </ToolTip>
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
