import React, { Component } from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash'
import {
    initList,
    invalidateList,
    selectItems,
    collapse_list,
    expand_list,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getSelectedItemIds,
    getSelectedItems,
    getDisplayMode
} from '../actions/ItemList'
import {
    invalidateAllReleaseNotes,
    fetchReleaseNotesIfNeeded
} from '../actions/ReleaseNotes'
import { ENTITY_KEY__RELEASE_NOTE } from '../actions/ItemListKeyRegistry'
import Timestamp from './Timestamp'

class ReleaseNotes extends Component {

    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(initList(list_key))
	dispatch(fetchReleaseNotesIfNeeded(list_key))
    }

    componentWillReceiveProps() {
        const { dispatch, list_key } = this.props
        dispatch(fetchReleaseNotesIfNeeded(list_key))
    }
    
    render() {

        const { release_notes, is_loading } = this.props

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }
        
        return (
            <div className="release_notes">

              { map(release_notes, function(release_note) {
                    return (
                        <div className="release_note">
                          <div className="release_note__header">
                            <Timestamp value={release_note.created} />
                            {release_note.header}
                          </div>
                          <div className="release_note__content">
                            {release_note.content}
                          </div>
                        </div>
                    )
                }
                ) }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__RELEASE_NOTE)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)

    return {
        release_notes: visible_items,
        release_note_ids: visible_item_ids,
        loading_item_ids,
        is_loading,
        last_updated
    }
}

export default connect(mapStateToProps)(ReleaseNotes)
