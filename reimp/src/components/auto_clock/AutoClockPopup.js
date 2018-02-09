import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'

class AutoClockPopup extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(props) {
        this.refresh(props)
    }

    refresh(these_props) {
        const props = these_props || this.props
    }

    render() {
        const { } = this.props

        return (
            <div className="auto-clock">
              <div className="auto-clock__header">Auto clock</div>
              <div className="auto-clock__status">Not clocked in</div>
              <div className="auto-clock__actions">Clock in</div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {  } = props
    return {}

}

export default connect(mapStateToProps)(AutoClockPopup)
