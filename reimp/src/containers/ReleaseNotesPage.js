import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureReleaseNotesLoaded, getReleaseNote} from '../actions/ReleaseNotes'
import includes from 'lodash/includes'
import {
    PAGE_KEY__RELEASE_NOTES_PAGE,
    LIST_KEY__RELEASE_NOTES_EDITOR_LIST,
} from '../actions/ItemListKeyRegistry.js'
import {
    selectItems,
    update_list_filter
} from '../actions/ItemList'
import ReleaseNotes from '../components/ReleaseNotes'
import ReleaseNoteCreatorForm from '../components/form/ReleaseNoteCreatorForm'
import {
    set_toolbars
} from '../actions/Page'
import { can_create_release_notes } from '../actions/Auth'
import { createReleaseNote, deleteReleaseNote } from '../actions/ReleaseNotes'

class ReleaseNotesPage extends Component {

    constructor(props) {
        super(props)
        this.onCreateReleaseNote = this.onCreateReleaseNote.bind(this)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__RELEASE_NOTES_PAGE, ['release-notes']))
        dispatch(update_list_filter(LIST_KEY__RELEASE_NOTES_EDITOR_LIST, {unseen:true}))
    }

    onCreateReleaseNote(values) {
        const { dispatch } = this.props
        dispatch(createReleaseNote(values.release_note_header, values.release_note_content))
    }

    render() {
        const { has_create_permission } = this.props
        return (
            <div className="release-notes-page">
              { has_create_permission &&
                <ReleaseNoteCreatorForm
                    onSubmit={this.onCreateReleaseNote}
                />
              }
              <ReleaseNotes list_key={LIST_KEY__RELEASE_NOTES_EDITOR_LIST} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const has_create_permission = can_create_release_notes(state)
    
    return {
        has_create_permission
    }
}

export default connect(mapStateToProps)(ReleaseNotesPage)
