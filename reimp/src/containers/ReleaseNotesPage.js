import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureReleaseNotesLoaded, getReleaseNote} from '../actions/ReleaseNotes'
import includes from 'lodash/includes'
import {
    PAGE_KEY__RELEASE_NOTES_PAGE,
    LIST_KEY__RELEASE_NOTES_LIST,
} from '../actions/ItemListKeyRegistry.js'
import {
    selectItems,
    update_list_filter
} from '../actions/ItemList'
import ReleaseNotes from '../components/ReleaseNotes'
import {
    set_toolbars
} from '../actions/Page'

class ReleaseNotesPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {dispatch} = this.props
        dispatch(set_toolbars(PAGE_KEY__RELEASE_NOTES_PAGE, ['release-notes']))
        dispatch(update_list_filter(LIST_KEY__RELEASE_NOTES_LIST, {unseen:true}))
    }

    render() {
        return (
            <div className="release-notes-page">
              <ReleaseNotes list_key={LIST_KEY__RELEASE_NOTES_LIST} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    return {
    }
}

export default connect(mapStateToProps)(ReleaseNotesPage)
