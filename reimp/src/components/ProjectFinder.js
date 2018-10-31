import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import { css } from 'emotion'
import { map } from 'lodash'
import Bookmark from './Bookmark'
import { getAutoBookmarks } from '../actions/Bookmarks'

class ProjectFinder extends Component {

    render() {
        const { bookmarks } = this.props
        return (
            <div className={css`display: flex;
                                flex-direction: column;
                            `}>

              { map(bookmarks, (bookmark) => (
                    <Bookmark bookmark={bookmark} />
              ))}
              
              <Link to="/projects">All projects</Link>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const bookmarks = getAutoBookmarks()
    
    return {
        bookmarks
    }
}

export default withRouter(connect(mapStateToProps)(ProjectFinder))
