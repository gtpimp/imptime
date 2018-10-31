import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { css } from 'emotion'
import { size, take, map } from 'lodash'
import Bookmark from './Bookmark'
import { default_theme as theme } from '../theme/default'
import { getAutoBookmarks } from '../actions/Bookmarks'
import PopupPanelLink from './PopupPanelLink'

class ProjectFinder extends Component {

    render() {
        const { bookmarks } = this.props
        return (
            <div className={css`display: flex;
                                flex-direction: column;
                            `}>
              { size(bookmarks) > 0 &&
                <div className={css`margin-bottom:${theme.spacing.two}`}>
                  { map(bookmarks, (bookmark, index) => (
                        <Bookmark key={`project_finder_bookmarks_${index}`}
                                  bookmark={bookmark} />
                    ))}
                </div>
              }
              
              <PopupPanelLink to="/projects">All projects</PopupPanelLink>
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const bookmarks = take(getAutoBookmarks(), 20)
    
    return {
        bookmarks
    }
}

export default withRouter(connect(mapStateToProps)(ProjectFinder))
