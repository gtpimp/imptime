import React, { Component } from 'react'
import { connect } from 'react-redux'
import Timestamp from './Timestamp'

export class TimestampRange extends Component {

    renderDefault() {
        const { start, end, time_format } = this.props
        return (
            <div className="timestamp-range__wrapper">
              <div className="timestamp-range__cell">
                From
              </div>
              <div className="timestamp-range__start timestamp-range__cell">
                <Timestamp value={start} format={time_format}/>
              </div>
              <div className="timestamp-range__label timestamp-range__cell">
                To
              </div>
              <div className="timestamp-range__end timestamp-range__cell">
                <Timestamp value={end} format={time_format}/>
              </div>
            </div>
        )
    }

    renderSingleDay() {
        const { start, end, time_format } = this.props
        return (
            <div className="timestamp-range__wrapper">
              <div className="timestamp-range__cell">
                On 
              </div>
              <div className="timestamp-range__cell">
                <Timestamp value={start} format="short-date" />
              </div>
              <div className="timestamp-range__cell">
                from
              </div>
              <div className="timestamp-range__start timestamp-range__cell">
                <Timestamp value={start} format={time_format}/>
              </div>
              <div className="timestamp-range__label timestamp-range__cell">
                to
              </div>
              <div className="timestamp-range__end timestamp-range__cell">
                <Timestamp value={end} format={time_format}/>
              </div>
            </div>
        )
    }
    
    render() {
        const { range_format } = this.props

        if ( range_format === 'default' ) {
            return this.renderDefault()
        } else if ( range_format === 'single-day' ) {
            return this.renderSingleDay()
        }
    }
}

function mapStateToProps(state, props) {
    return {
        start: props.start,
        end: props.end,
        range_format: props.range_format || 'default',
        time_format: props.time_format || 'default'
    }
}

export default connect(mapStateToProps)(TimestampRange)
