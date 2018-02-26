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

        function timeToNumber (time) {
            if (time === "00:00") {
                return 0
            }
            time = time.replace(/^0+/, '')
            var timeNumRep = time.split(/[.:]/)
            var hours = Number(timeNumRep[0])
            var mins = Math.round((Number(timeNumRep[1]) / 60) * 100) / 100
            var timeValue = hours + mins
            return timeValue
        }

        var currentTime = timeToNumber(current)
        var maxTime = timeToNumber(max)

        if ( !maxTime && currentTime>0 ) {
            sections.push({
                percentage: 1.0,
                style: 'invalid'
            })
        } else {
            if (currentTime <= maxTime) {
                sections.push({
                    percentage: currentTime / maxTime,
                    style: 'progress'
                })
                sections.push({
                    percentage: (maxTime - currentTime) / maxTime,
                    style: 'remaining'
                })
            } else if (currentTime > maxTime) {
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
