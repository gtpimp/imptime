import React, {Component} from 'react'
import {connect} from 'react-redux'
import { keys, map, includes } from 'lodash'
import { getMienBeingConfigured } from '../actions/Mien'

class ListColumnConfigurer extends Component {

    updateIssueHeaderConfiguration(event, header_key, enabled) {
        event.stopPropagation()
        /* const { mien_being_configured } = this.props
         * const all_headers = getAllAvailableIssueHeaders()
         * var issue_headers = mien_being_configured.issue_headers
         * map(keys(all_headers), function(header_key) {
         *     
         * })
         * dispatch(updateMienIssueHeaders(mien_being_configured.id, issue_headers))*/
    }

    render() {
        const { mien, all_headers, active_headers } = this.props
        const that = this
        return (
            <div>
              <h3>Configuring issue list for {mien.title}</h3>
              <div className="list_header_configurer">
                { map(keys(all_headers), function(header_key) {
                      const header = all_headers[header_key]
                      const label = header.description || header.label || header_key.replace(/_/g, " ")
                      const is_enabled = includes(keys(mien.issue_headers), header_key)
                      return (
                          <div key={header_key}
                               onClick={(event) => that.updateIssueHeaderConfiguration(event, header_key, !is_enabled)}>
                            {label}
                          </div>
                      )
                  })
                }
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    
    const { onSave, all_headers, active_headers } = props
    const mien = getMienBeingConfigured(state)
    
    return {
        mien,
        onSave,
        all_headers,
        active_headers
    }
}

export default connect(mapStateToProps)(ListColumnConfigurer)
