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
        const fullWidth = Math.max(current, max)
        const sections = []

        if ( !max && current>0 ) {
            sections.push({
                percentage: 1.0,
                style: 'invalid'
            })
        } else {
            if (current <= max) {
                sections.push({
                    percentage: current / fullWidth,
                    style: 'progress'
                })
                sections.push({
                    percentage: (max - current) / fullWidth,
                    style: 'remaining'
                })
            }
            /* if (current > max) {
             *     sections.push({
             *         percentage: max / fullWidth,
             *         style: 'progress'
             *     })
             * }*/
            if (current > max) {
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
