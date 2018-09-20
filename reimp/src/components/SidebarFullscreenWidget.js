import React, {Component} from 'react'
import { css } from 'emotion'

import { default_theme as theme } from '../theme/default'
import EditableIssueTitle from './EditableIssueTitle'

const style = css`
position: absolute;
bottom: 0;
right: 0;
`

class SidebarFullscreenWidget extends Component {

    render() {
        const {
            full_screen_mode_available,
            sidebar_view_mode,
            onExitFullscreen,
            onFullscreen
        } = this.props

        return (
            <div className={ style }>
              { full_screen_mode_available && sidebar_view_mode === 'fullscreen' && 
                <div className="icon--fullscreen-exit"
                     onClick={onExitFullscreen}/>
              }
              { full_screen_mode_available && sidebar_view_mode !== 'fullscreen'  && 
                <div className="icon--fullscreen"
                     onClick={onFullscreen}/>
              }
            </div>
        )
    }
}
export default SidebarFullscreenWidget
