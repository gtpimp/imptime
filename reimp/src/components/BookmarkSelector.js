import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getBreadcrumbs } from '../actions/Breadcrumbs'
import {withRouter} from 'react-router-dom'
import { getBookmarks, removeBookmark, bookmarkCurrent } from '../actions/Bookmarks'
import { css } from 'emotion'
import { map } from 'lodash'
import PopupPanelButton from './PopupPanelButton'
import PopupPanelHeading from './PopupPanelHeading'
import PopupPanelText from './PopupPanelText'
import Bookmark from './Bookmark'

class BookmarkSelector extends Component {

    onAddBookmark = (evt) => {
        const { dispatch } = this.props
        evt.preventDefault()
        dispatch(bookmarkCurrent())
    }

    onRemoveBookmark = (evt, bookmark) => {
        evt.preventDefault()
        if (! window.confirm("Delete this bookmark?")) {
            return false
        }
        removeBookmark(bookmark)
    }

    renderBookmarks() {
        const { bookmarks } = this.props
        return (
            <div>
              { map(bookmarks, (bookmark, index) =>
                  <div key={`bookmarkselector_${bookmark.leaf_id}_${index}`}>
                    <Bookmark bookmark={bookmark} />
                    <div className="mien-editor-button-bar__button icon--small-delete" onClick={(event) => this.onRemoveBookmark(event, bookmark)}/>
                  </div>
                )}
            </div>
        )
    }

    renderButtonBar() {
        return (
            <div>
                <PopupPanelButton onClick={this.onAddBookmark}>
                  + Add current page as bookmark
                </PopupPanelButton>
            </div>
        )
    }

    render() {
        return (
            <div className={css`display: flex;
                                flex-direction: column;
                            `}>
              <PopupPanelHeading>
                Bookmarks
              </PopupPanelHeading>
              <PopupPanelText>
                Bookmarks are pinned pages for quick navigation
              </PopupPanelText>
              { this.renderBookmarks() }
              { this.renderButtonBar() }
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const bookmarks = getBookmarks()
    const breadcrumbs = getBreadcrumbs(state)

    return {
        bookmarks,
        breadcrumbs
    }
}

export default withRouter(connect(mapStateToProps)(BookmarkSelector))
