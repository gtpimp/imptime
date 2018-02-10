import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import classNames from 'classnames'
import '../../sass/auto-clock.scss'
import { getAutoClock, ensureAutoClocksLoaded } from '../../actions/AutoClock'

class AutoClockEntry extends Component {
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
        const { entry_id, dispatch } = props
        dispatch(ensureAutoClocksLoaded([entry_id]))
    }

    render() {
        const { entry } = this.props

        return (
            <div className="auto-clock-entry">
              {entry.id}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { entry_id  } = props
    const entry = getAutoClock(state, entry_id) || {}
    return {
        entry_id,
        entry
    }

}

export default connect(mapStateToProps)(AutoClockEntry)
