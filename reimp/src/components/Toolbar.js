import React, {Component} from 'react'
import {connect} from 'react-redux'
import ToolbarButton from './ToolbarButton'

class Toolbar extends Component {

    render() {
        const {actions} = this.props

        return (
            <div className="toolbar">
                <div className="toolbar__container">
                    <div className="toolbar__item">
                        <button className="button button--default button--primary">New (N)</button>
                    </div>
                    <div className="toolbar__item">
                        <div className="toolbar__label">Inbox</div>
                    </div>
                </div>
                <div className="toolbar__container">
                    {actions.each((action) => {
                        <div className="toolbar__item toolbar__item--icon-button">
                            <ToolbarButton onClick={action.onClick} icon={action.icon}/>
                        </div>
                    })}
                    <div className="toolbar__item toolbar__item--icon-button">
                        <div className="icon--info"/>
                    </div>
                    <div className="toolbar__item toolbar__item--icon-button">
                        <div className="icon--settings"/>
                    </div>
                    <div className="toolbar__item toolbar__item--icon-button">
                        <div className="icon--more"/>
                    </div>
                    <div className="toolbar__separator"></div>
                    <div className="toolbar__item">
                        <div className="mode__dropdown">Richard Mode</div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {toolbar} = this.state
    console.log(toolbar)
    return {
        actions: toolbar.actions
    }
}


export default connect(mapStateToProps)(Toolbar)
