import cookie from 'react-cookies'
import { compact, filter, find } from 'lodash'

const KEY = 'bookmarks'

export function getBookmarks() {
    const bookmarks = cookie.load(KEY)
    if ( ! bookmarks ) {
        return []
    }
    return compact(bookmarks.bookmarks) || []
}

export function addBookmark(name, url) {
    const bookmarks = getBookmarks()

    if ( find(bookmarks, (bookmark) => bookmark.name === name) ) {
        return pushBookmarkToTop(name)
    }
    
    bookmarks.unshift({name:name, url:url})
    save(bookmarks)
    return bookmarks
}

export function removeBookmark(name) {
    let bookmarks = getBookmarks()
    bookmarks = filter(bookmarks, (bookmark) => bookmark.name !== name)
    save(bookmarks)
    return bookmarks
}

export function pushBookmarkToTop(name) {
    let bookmarks = getBookmarks()

    const bookmark = find(bookmarks, (bookmark) => bookmark.name === name)
    bookmarks = filter(bookmarks, (bookmark) => bookmark.name !== name)
    bookmarks.unshift(bookmark)
    save(bookmarks)
    return bookmarks
}

function save(bookmarks) {
    cookie.save(KEY, {bookmarks:bookmarks}, {path: '/'})
}
