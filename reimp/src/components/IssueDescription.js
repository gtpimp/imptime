import React, {Component} from 'react'
import {connect} from 'react-redux'
import TextComponent from './TextComponent'

class IssueDescription extends Component {

    handleChange(e) {
        console.log('Changed value to: ', e.target.value)
    }

    renderView(issue) {
        return (
            <div className="issue-description issue-description--readonly">{issue.description}</div>
        )
    }

    renderEmptyState() {
        return (
            <div className="issue-description issue-description--empty">Description</div>
        )
    }

    renderEdit(issue) {
        return (
            <TextComponent placeholder="Description" onChange={ this.handleChange }/>
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


export default connect(mapStateToProps)(IssueDescription)
