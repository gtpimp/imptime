import React, {Component} from 'react'
import {connect} from 'react-redux'
import EditableProperty from '../form/EditableProperty'
import { updateAutoClocks, getAutoClock, ensureAutoClocksLoaded, deleteAutoClocks } from '../../actions/AutoClock'
import AutoClockEntry from './AutoClockEntry'
import AutoClockEntryForm from './AutoClockEntryForm'

class EditableAutoClockEntry extends Component {

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onDeleteEntry = this.onDeleteEntry.bind(this)
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
        dispatch(updateAutoClocks([entry_id], new_values.role_name, new_values.description,
                                  new_values.start_time.format('YYYY-MM-DDTHH:mm:ss'),
                                  new_values.end_time.format('YYYY-MM-DDTHH:mm:ss')))
    }

    onDeleteEntry() {
        const { dispatch, entry_id } = this.props
        if ( ! confirm( "Are you sure you want to delete this clock entry?" ) ) {
            return false
        }
        dispatch(deleteAutoClocks([entry_id]))
    }

    render() {
        const { entry, can_edit, time_format } = this.props

        return (
            <EditableProperty property_key={'entry_id_'+entry.id}
                              initial_value={entry}
                              onChange={this.onChange}
                              can_edit={can_edit}
                              edit_as_modal={false}
            >
              <AutoClockEntryForm entry_id={entry.id} onDelete={this.onDeleteEntry} />
              <div>
                <AutoClockEntry entry_id={entry.id} time_format={time_format} />
              </div>
              <div>
              </div>
            </EditableProperty>
        )
    }
}

function mapStateToProps(state, props) {
    const { entry_id, time_format } = props
    const entry = getAutoClock(state, entry_id) || {}
    const can_edit = true
    return {
        entry: entry,
        can_edit: can_edit,
        time_format,
    }
}


export default connect(mapStateToProps)(EditableAutoClockEntry)
