import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal';
import {
    fetchReleaseNotesIfNeeded,
    markReleaseNotesAsSeen
} from '../actions/ReleaseNotes'
import { update_list_filter, initList, getVisibleItemIds, shouldFetchList } from '../actions/ItemList'
import { LIST_KEY__RELEASE_NOTES_LIST, } from '../actions/ItemListKeyRegistry'
import ReleaseNotes from './ReleaseNotes'

class ReleaseNotesPopup extends Component {

    constructor(props) {
        super(props)
        this.markAsRead = this.markAsRead.bind(this)
        this.willReadLater = this.willReadLater.bind(this)
        
        this.state = {
            userClosedModal: false
        }
        
    }
    
    componentDidMount() {
	const { dispatch, list_key } = this.props
	dispatch(initList(list_key))
        dispatch(update_list_filter(list_key, { unseen: true }))
	dispatch(fetchReleaseNotesIfNeeded(list_key))
    }

    componentWillReceiveProps() {
        const { dispatch, list_key } = this.props
        dispatch(fetchReleaseNotesIfNeeded(list_key))
    }

    markAsRead() {
        const { dispatch, release_note_ids } = this.props
        dispatch(markReleaseNotesAsSeen(release_note_ids))
        this.setState({userClosedModal: true})
    }

    willReadLater() {
        this.setState({userClosedModal: true})
    }

    render() {

        const { has_release_notes, list_key } = this.props

        if ( ! has_release_notes ) {
            return null
        }

        return (
            <Modal isOpen={!this.state.userClosedModal}
                   contentLabel="Release Notes"
                   onRequestClose={this.closeModal} >
              <h2>Some things have changed</h2>
              <div className="release-notes__buttons">
                <button className="release-notes__close button button--primary button--large" onClick={this.markAsRead}>Read it</button>
                <button className="release-notes__later button button--secondary button--large" onClick={this.willReadLater}>Will read later</button>
              </div>
              <ReleaseNotes list_key={list_key} />
            </Modal>
        )

    }
}

function mapStateToProps(state, props) {
    const list_key = LIST_KEY__RELEASE_NOTES_LIST
    const visible_item_ids = getVisibleItemIds(state, list_key) || []
    const should_fetch_list = shouldFetchList(state, list_key)

    return {
        has_release_notes: visible_item_ids.length > 0,
        release_note_ids: visible_item_ids,
        should_fetch_list,
        list_key
    }
}

export default connect(mapStateToProps)(ReleaseNotesPopup)
