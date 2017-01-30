import React, {Component} from 'react'
import {connect} from 'react-redux'
import TextComponent from './TextComponent'

class IssueTitle extends Component {

    handleChange(e) {
        console.log('Changed value to: ', e.target.value)
    }

    renderView(issue) {
        return (
            <div className="issue-title issue-title--readonly">{issue.title}</div>
        )
    }

    renderEmptyState() {
        return (
            <div className="issue-title issue-title--empty">Title</div>
        )
    }

    renderEdit(issue) {
        return (
            <TextComponent placeholder="Title" onChange={ this.handleChange }/>
        )
    }

    render() {
        const {issue, mode} = this.props
        return (
            <div>
                { mode === 'view-value' &&
                this.renderView(issue)
                }
                { mode === 'view-empty-state' &&
                this.renderEmptyState()
                }
                { mode === 'edit' &&
                this.renderEdit(issue)
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {}
}


export default connect(mapStateToProps)(IssueTitle)
