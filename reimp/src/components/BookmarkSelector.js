import React, {Component} from 'react'
import {connect} from 'react-redux'
import { getBreadcrumbs } from '../actions/Breadcrumbs'
import {withRouter} from 'react-router-dom'
import { getBookmarks, addBookmark, removeBookmark, pushBookmarkToTop } from '../actions/Bookmarks'
import { css } from 'emotion'
import { join, map } from 'lodash'
import PopupPanelButton from './PopupPanelButton'
import PopupPanelLink from './PopupPanelLink'
import PopupPanelHeading from './PopupPanelHeading'
import PopupPanelText from './PopupPanelText'

class BookmarkSelector extends Component {

    onGotoBookmark = (evt, bookmark) => {
        const { history } = this.props
        evt.preventDefault()
        history.push(bookmark.url)
        pushBookmarkToTop(bookmark.name)
    }

    onAddBookmark = (evt) => {
        const { breadcrumbs } = this.props
        evt.preventDefault()
        const url = window.location.pathname

        const name_parts = []
        map(breadcrumbs, (breadcrumb) => name_parts.push(breadcrumb.label))
        const name = join(name_parts, " > ")
        addBookmark(name, url)
    }

    onRemoveBookmark = (evt, bookmark) => {
        evt.preventDefault()
        if (! window.confirm("Delete this bookmark?")) {
            return false
        }
        removeBookmark(bookmark.name)
    }

    renderBookmarks() {
        const { bookmarks } = this.props
        return (
            <div>
              { map(bookmarks, (bookmark) =>
                  <PopupPanelLink key={bookmark.name}>
                    <div className={css`display:flex; flex-direction: row; justify-content: space-between;`}
                         onClick={(evt) => this.onGotoBookmark(evt, bookmark) } >
                      {bookmark.name}
                      <div className="mien-editor-button-bar__button icon--small-delete" onClick={(event) => this.onRemoveBookmark(event, bookmark)}/>
                    </div>
                  </PopupPanelLink>
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
