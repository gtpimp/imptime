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

        const d = {role_name:new_values.role_name,
                   description:new_values.description}
        if ( new_values.start_time.isValid() ) {
            d.start_time = new_values.start_time.format('YYYY-MM-DDTHH:mm:ss')
        }
        if ( new_values.end_time.isValid() ) {
            d.end_time = new_values.end_time.format('YYYY-MM-DDTHH:mm:ss')
        }
        dispatch(updateAutoClocks([entry_id], d))
    }

    onDeleteEntry(evt) {
        const { dispatch, entry_id } = this.props
        if ( evt ) {
            evt.preventDefault()
        }
        if ( ! window.confirm( "Are you sure you want to delete this clock entry?" ) ) {
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
                              edit_as_modal={true}
                              modal_variant="large"
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
