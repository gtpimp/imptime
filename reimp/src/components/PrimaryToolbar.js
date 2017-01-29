import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../sass/primary-toolbar.css'
import Breadcrumbs from './Breadcrumbs'
import ToolbarButton from './ToolbarButton'
import map from 'lodash/map'

class PrimaryToolBar extends Component {

    constructor(props) {
        super(props)
        this.onEnableInfo = this.onEnableInfo.bind(this)
        this.onDisableInfo = this.onDisableInfo.bind(this)
        this.onShowSettings = this.onShowSettings.bind(this)
    }

    onEnableInfo() {
        console.log('click1')
    }

    onDisableInfo() {
        console.log('click2')
    }

    onShowSettings() {
        console.log('click3')
    }

    render() {
        const {actions, breadcrumbs} = this.props
        return (
            <div className="primary-toolbar">
                <div className="primary-toolbar__container primary-toolbar__container--left">
                    <Breadcrumbs breadcrumbs={breadcrumbs}/>
                </div>
                <div className="primary-toolbar__container primary-toolbar__container--right">
                    <ToolbarButton style="toggle" isEnabled={true} onEnable={this.onEnableInfo} onDisable={this.onDisableInfo} icon="info"/>
                    <ToolbarButton onClick={this.onShowSettings} icon="settings"/>
                    {actions.map((action, index) => {
                        return (
                            <ToolbarButton key={'toolbar_action_' + index} onClick={action.onClick} icon={action.icon}/>
                        )
                    })}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {breadcrumbs, toolbar} = state

    return {
        actions: toolbar.actions,
        breadcrumbs: breadcrumbs
    }
}


export default connect(mapStateToProps)(PrimaryToolBar)
