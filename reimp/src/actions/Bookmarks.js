import cookie from 'react-cookies'
import { first, map, compact, filter, find } from 'lodash'
import { getRootEntityBreadcrumb, getBreadcrumbs } from './Breadcrumbs'

const KEY = 'bookmarks'
const AUTO_KEY = 'auto_bookmarks'

function createBookmarkFromBreadcrumbs(breadcrumbs) {
    const root_breadcrumb = getRootEntityBreadcrumb(breadcrumbs)
    if ( root_breadcrumb === null ) {
        return
    }
    const bookmark = {parts: []}

    if ( root_breadcrumb.selected_entities.project ) {
        bookmark.entity_type = "project"
        bookmark.entity_id = root_breadcrumb.selected_entities.project.id
    } else if ( root_breadcrumb.selected_entities.company ) {
        bookmark.entity_type = "company"
        bookmark.entity_id = root_breadcrumb.selected_entities.company.id
    } else {
        console.error("Unknown breadcrumb type while creating bookmark")
        return null
    }
    bookmark.id = `${bookmark.entity_type}_${bookmark.entity_id}`
    
    map(breadcrumbs, (breadcrumb) => {
        bookmark.parts.push( {label: breadcrumb.label,
                              url: breadcrumb.to} )
    })
    return bookmark
}

export function autoBookmarkCurrent() {
    return (dispatch, getState) => {

        return null
        
        const state = getState()
        const breadcrumbs = getBreadcrumbs(state)
        const new_auto_bookmark = createBookmarkFromBreadcrumbs(breadcrumbs)
        if ( new_auto_bookmark === null ) {
            return null
        }

        let existing_auto_bookmarks = getAutoBookmarks()
        const existing_auto_bookmark = first(filter(existing_auto_bookmarks, (x) => x.id === new_auto_bookmark.id))
        if ( existing_auto_bookmark ) {
            existing_auto_bookmarks = filter(existing_auto_bookmarks, (x) => x.id !== existing_auto_bookmark.id)
        }
        existing_auto_bookmarks.unshift(new_auto_bookmark)
        saveAutoBookmarks(existing_auto_bookmarks)
    }
}

export function bookmarkCurrent() {
    return (dispatch, getState) => {
        const state = getState()
        const breadcrumbs = getBreadcrumbs(state)
        const new_bookmark = createBookmarkFromBreadcrumbs(breadcrumbs)
        if ( new_bookmark === null ) {
            return null
        }
        addBookmark(new_bookmark)
    }
}

export function addBookmark(new_bookmark) {
    const bookmarks = getBookmarks()
    if ( find(bookmarks, (x) => x.id === new_bookmark.id) ) {
        return pushBookmarkToTop(new_bookmark)
    }
    
    bookmarks.unshift(new_bookmark)
    saveBookmarks(bookmarks)
    return bookmarks
}

export function removeBookmark(bookmark) {
    let bookmarks = getBookmarks()
    bookmarks = filter(bookmarks, (x) => x.id !== bookmark.id)
    saveBookmarks(bookmarks)
    return bookmarks
}

export function pushBookmarkToTop(bookmark) {
    let bookmarks = getBookmarks()
    const existing_bookmark = find(bookmarks, (x) => x.id === bookmark.id)
    bookmarks = filter(bookmarks, (x) => x.id !== existing_bookmark.id)
    bookmarks.unshift(bookmark)
    saveBookmarks(bookmarks)
    return bookmarks
}

export function getBookmarks() {
    const bookmarks = cookie.load(KEY)
    if ( ! bookmarks ) {
        return []
    }
    return compact(bookmarks.bookmarks) || []
}

function saveBookmarks(bookmarks) {
    cookie.save(KEY, {bookmarks:bookmarks}, {path: '/'})
}

export function getAutoBookmarks() {
    const bookmarks = cookie.load(AUTO_KEY)
    if ( ! bookmarks ) {
        return []
    }
    return compact(bookmarks.bookmarks) || []
}

function saveAutoBookmarks(bookmarks) {
    cookie.save(AUTO_KEY, {bookmarks:bookmarks}, {path: '/'})
}
