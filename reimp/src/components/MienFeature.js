import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'
import { updateMienFeature,
         doesMienHaveFeature,
         getMienBeingConfigured,
         isMienConfigurerActive
} from '../actions/Mien'

class MienFeature extends Component {

    constructor(props) {
        super(props)
        this.state = { 'is_hovered': false }
        this.onHover = this.onHover.bind(this)
        this.onUnhover = this.onUnhover.bind(this)
        this.onSelect = this.onSelect.bind(this)
    }

    onHover() {
        this.setState({ is_hovered: true })
    }

    onUnhover() {
        this.setState({ is_hovered: false })
    }

    onSelect(event) {
        const { dispatch, mien_being_configured, feature_name, feature_is_active } = this.props
        event.preventDefault()
        event.stopPropagation()
        dispatch(updateMienFeature(mien_being_configured.id, feature_name, !feature_is_active))
    }

    renderFeatureSelector() {
        const { feature_is_active } = this.props
        const { is_hovered } = this.state

        if ( this.props.children.length > 1 ) {
            return <div>Can only have a single child, consider wrapping in a div</div>
        }
        
        return (
            <div className={classNames("mien-feature-highlighter",
                                       {"mien-feature-highlighter--highlighted":is_hovered,
                                        "mien-feature-highlighter--active":feature_is_active,
                                        "mien-feature-highlighter--inactive":!feature_is_active})}
                 onMouseEnter={this.onHover}
                 onMouseLeave={this.onUnhover}
                 onClick={this.onSelect}>
              <div className={classNames("mien-feature-highlighter--mask",
                                         {"mien-feature-highlighter--mask-active":feature_is_active,
                                          "mien-feature-highlighter--mask-inactive":!feature_is_active})}/>
              { feature_is_active && <div>Visible</div> }
              { !feature_is_active && <div>Hidden</div> }
              {this.props.children}
            </div>
        )        
    }
    
    render() {

        const { feature_is_active, is_mien_configurer_active } = this.props

        if ( is_mien_configurer_active ) {
            return this.renderFeatureSelector()
        } else if ( ! feature_is_active ) {
            return null
        } else {
            return (
                <div className="mien-feature">
                  {this.props.children}
                </div>
            )
        }
    }
}

function mapStateToProps(state, props) {
    const { feature_name } = props
    const is_mien_configurer_active = isMienConfigurerActive(state)
    const mien_being_configured = getMienBeingConfigured(state)
    
    const feature_is_active = doesMienHaveFeature(state, feature_name)
    
    return {
        is_mien_configurer_active,
        mien_being_configured,
        feature_name,
        feature_is_active
    }
}

export default connect(mapStateToProps)(MienFeature)
