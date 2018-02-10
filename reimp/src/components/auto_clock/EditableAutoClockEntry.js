import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from './form/EditableProperty'
import WikiForm from './form/WikiForm'
import { updateAutoClock, getAutoClock, ensureAutoClocksLoaded } from '../actions/AutoClock'
import Blank from './form/Blank'
import ReactMarkdown from 'react-markdown'
import AutoClockEntry from './AutoClockEntry'
import AutoClockEntryForm from './AutoClockEntryForm'

class EditableAutoClockEntry extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
        this.refresh()
    }
    
    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const props = these_props || this.props
        const { entry_id, dispatch } = props
        dispatch(ensureAutoClocksLoaded([entry_id]))
    }

    onChange(new_values) {
        const { dispatch, entry_id } = this.props
        dispatch(updateAutoClock(entry_id, new_values))
    }

    render() {
        const { entry, can_edit } = this.props

        return (
            <EditableProperty property_key={'entry_id_'+entry.id}
                              initial_value={content}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              edit_as_model={true}
            >
              <AutoClockEntryForm />
              <div>
                <AutoClockEntry entry_id={entry.id} />
              </div>
              <div>
              </div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { entry_id } = props
    const entry = getAutoClock(state, entry_id) || {}
    const can_edit = true
    return {
        entry: entry,
        can_edit: can_edit
    }
}


export default connect(mapStateToProps)(EditableAutoClockEntry)
