import cookie from 'react-cookies'
import { size, first, map, compact, filter, find } from 'lodash'
import { getRootEntityBreadcrumb, getLeafEntityBreadcrumb, getBreadcrumbs } from './Breadcrumbs'

const KEY = 'bookmarks'
const AUTO_KEY = 'auto_bookmarks'

function createBookmarkFromBreadcrumbs(breadcrumbs) {
    const root_breadcrumb = getRootEntityBreadcrumb(breadcrumbs)
    const leaf_breadcrumb = getLeafEntityBreadcrumb(breadcrumbs)
    if ( !root_breadcrumb || !leaf_breadcrumb  ) {
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
    bookmark.leaf_id = leaf_breadcrumb.to
    
    map(breadcrumbs, (breadcrumb) => {
        bookmark.parts.push( {label: breadcrumb.label,
                              url: breadcrumb.to} )
    })
    return bookmark
}

function doesBookmarkASubsumeBookmarkB(bookmark_a, bookmark_b) {
    if ( size(bookmark_a.parts) <= size(bookmark_b.parts) ) {
        return false
    }
    let subsumes = true
    map(bookmark_b.parts, (part_b, index) => {
        const part_a = bookmark_b.parts[index]
        if (part_a.url != part_b.url) {
            subsumes = false
            return
        }
    })
    return subsumes
}

export function autoBookmarkCurrent(optional_breadcrumbs) {
    return (dispatch, getState) => {
        const state = getState()
        const breadcrumbs = optional_breadcrumbs || getBreadcrumbs(state)
        const new_auto_bookmark = createBookmarkFromBreadcrumbs(breadcrumbs)
        if ( !new_auto_bookmark ) {
            return null
        }

        let existing_auto_bookmarks = getAutoBookmarks()
        const existing_auto_bookmark = first(filter(existing_auto_bookmarks, (x) => x.id === new_auto_bookmark.id))
        if ( existing_auto_bookmark ) {
            existing_auto_bookmarks = filter(existing_auto_bookmarks, (x) => x.id !== existing_auto_bookmark.id)
        }

        if ( doesBookmarkASubsumeBookmarkB(existing_auto_bookmark, new_auto_bookmark) ) {
            existing_auto_bookmarks.unshift(existing_auto_bookmark)
        } else {
            existing_auto_bookmarks.unshift(new_auto_bookmark)
        }
        saveAutoBookmarks(existing_auto_bookmarks)
    }
}

export function bookmarkCurrent() {
    return (dispatch, getState) => {
        const state = getState()
        const breadcrumbs = getBreadcrumbs(state)
        const new_bookmark = createBookmarkFromBreadcrumbs(breadcrumbs)
        if ( !new_bookmark ) {
            return null
        }
        addBookmark(new_bookmark)
    }
}

export function addBookmark(new_bookmark) {
    const bookmarks = getBookmarks()
    if ( find(bookmarks, (x) => x.leaf_id === new_bookmark.leaf_id) ) {
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
    bookmarks = filter(bookmarks, (x) => x.leaf_id !== bookmark.leaf_id)
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
