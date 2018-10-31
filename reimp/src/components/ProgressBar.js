import React, {Component} from 'react'
import {connect} from 'react-redux'
import classNames from 'classnames'

class ProgressBar extends Component {

    renderSection(section, index) {
        return (
            <div key={'section__' + index}
                 className={classNames('progress-bar__section', 'progress-bar__section--' + section.style)}
                 style={{width: (section.percentage * 100) + "%"}}>
              {section.label}
            </div>
        )
    }

    render() {
        const {current, max} = this.props
        const sections = []

        if ( max === null && current === null ) {
            sections.push({
                percentage: 1.0,
                style: 'notset'
            })
        } else if ( !max && current>0 ) {
            sections.push({
                percentage: 1.0,
                style: 'invalid'
            })
        } else {
            if (current <= max) {
                sections.push({
                    percentage: current / max,
                    style: 'progress'
                })
                sections.push({
                    percentage: (max - current) / max,
                    style: 'remaining'
                })
            } else if (current > max) {
                sections.push({
                    percentage: 1.0,
                    style: 'over'
                })
            }
        }
        return (
            <div className="progress-bar">
              { sections.map((section, index) => this.renderSection(section, index))}
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        current: props.current,
        max: props.max
    }
}

export default connect(mapStateToProps)(ProgressBar)
