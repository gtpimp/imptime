import React, {Component} from 'react'
import {connect} from 'react-redux'
import '../../sass/toolbar-panel.css'
import ToolbarButton from './ToolbarButton'

class ListToolbarPanel extends Component {

    onSettingsClick() {
        console.log('settings clicked')
    }

    onDisableInfoClick() {
        console.log('disable info clicked')
    }

    onEnableInfoClick() {
        console.log('enable info clicked')
    }

    render() {
        return (
            <div className="toolbar-panel">
                List:
                <ToolbarButton flavour="toggle" icon="info" isEnabled={true} onEnable={this.onEnableInfoClick} onDisable={this.onDisableInfoClick}/>
                <ToolbarButton icon="settings" onClick={this.onSettingsClick}/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(ListToolbarPanel)
