import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import { css } from 'emotion'
import { map } from 'lodash'
import PopupPanelLink from './PopupPanelLink'

class Bookmark extends Component {

    render() {
        const { bookmark } = this.props
        return (
            <div className={css`display: flex; `}>
              { map(bookmark.parts, (bookmark_part, index) => (
                    <div key={`bookmark_${bookmark.leaf_id}_${index}_${bookmark_part.url}`}
                         className={css`display: flex`}>
                      { index > 0 && <span>&gt;</span> }
                      <PopupPanelLink>
                        <Link to={bookmark_part.url} >
                          {bookmark_part.label}
                        </Link>
                      </PopupPanelLink>
                    </div>
                ))}
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const { bookmark } = props

    return {
        bookmark
    }
}

export default withRouter(connect(mapStateToProps)(Bookmark))
