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
import { isLoadingItems } from '../actions/Item'
import {
    invalidateAllReleaseNotes,
    fetchReleaseNotesIfNeeded,
    deleteReleaseNote
} from '../actions/ReleaseNotes'
import { ENTITY_KEY__RELEASE_NOTE } from '../actions/ItemListKeyRegistry'
import OtherUser from './OtherUser'
import Timestamp from './Timestamp'
import { can_delete_release_notes, can_seen_by_release_notes } from '../actions/Auth'

class ReleaseNotes extends Component {

    constructor(props) {
        super(props)
        this.onDeleteReleaseNote = this.onDeleteReleaseNote.bind(this)
    }
    
    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(initList(list_key))
	dispatch(fetchReleaseNotesIfNeeded(list_key))
    }

    componentWillReceiveProps() {
        const { dispatch, list_key } = this.props
        dispatch(fetchReleaseNotesIfNeeded(list_key))
    }

    onDeleteReleaseNote(event, release_note_id) {
        const { dispatch } = this.props
        event.stopPropagation()
        dispatch(deleteReleaseNote(release_note_id))
    }
    
    render() {

        const { release_notes, is_loading, has_delete_permission, has_seen_by_permission } = this.props
        const that = this

        if ( is_loading ) {
            return (
                <div>Loading...</div>
            )
        }
        
        return (
            <div className="release_notes">

              { map(release_notes, function(release_note) {
                    return (
                        <div key={release_note.id} className="release_note">
                          <div className="release_note__header">
                            { has_delete_permission &&
                              <div className="release_note__header_created">
                                <Timestamp value={release_note.created_at} />
                              </div>
                            }
                            { has_seen_by_permission &&
                              <div className="release_note__seen_by">
                                { release_note.seen_by_user_ids.length == 0 && <div>Not seen by anyone yet</div> }
                                { release_note.seen_by_user_ids.length > 0 &&
                                  <div>
                                    Seen by:
                                    {map(release_note.seen_by_user_ids, (user_id) => <div><OtherUser user_id={user_id} /><br/></div>)}
                                  </div>
                                }
                              </div>
                            } 
                            
                            <div className="release_note__header_title">
                              {release_note.header}
                            </div>
                          </div>
                          <div className="release_note__content">
                            {release_note.content}
                          </div>
                          { has_delete_permission &&
                            <div className="issue__small-delete-image"
                                 onClick={(event) => that.onDeleteReleaseNote(event, release_note.id)} />
                          }
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
    const is_loading = isLoading(state, list_key) || isLoadingItems(state, ENTITY_KEY__RELEASE_NOTE, visible_item_ids)
    const last_updated = getLastUpdated(state, list_key)
    const has_delete_permission = can_delete_release_notes(state)
    const has_seen_by_permission = can_seen_by_release_notes(state)

    return {
        release_notes: visible_items,
        release_note_ids: map(visible_items, 'id'),
        loading_item_ids,
        is_loading,
        last_updated,
        has_delete_permission,
        has_seen_by_permission
    }
}

export default connect(mapStateToProps)(ReleaseNotes)
