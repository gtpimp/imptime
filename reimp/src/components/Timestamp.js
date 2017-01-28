import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import moment from 'moment'

export class Timestamp extends Component {

    render() {

        const { style, value } = this.props
        const ts = moment(value)

        return (
            <div className="timestamp__wrapper">
                { value &&
                <div className="timestamp__container">
                    { style === 'default' &&
                    <div className="timestamp timestamp--default">
                        <div className="timestamp__instant">
                            {ts.format('LLLL')}
                        </div>
                        <div className="timestamp__description">
                            {ts.fromNow()}
                        </div>
                    </div>
                    }
                    { style === 'precise' &&
                    <div className="timestamp timestamp--precise">
                        <div className="timestamp__instant">
                            {ts.format('h:mm:ss a')}
                        </div>
                    </div>
                    }
                    { style === 'short-time' &&
                    <div className="timestamp timestamp--precise">
                        <div className="timestamp__instant">
                            {ts.format('h:mm')}
                        </div>
                    </div>
                    }
                    { style === 'short-date' &&
                    <div className="timestamp timestamp--precise">
                        <div className="timestamp__instant">
                            {ts.format('D MMM')}
                        </div>
                    </div>
                    }
                    { style === 'date' &&
                    <div className="timestamp timestamp--date">
                        <div className="timestamp__instant">
                            {ts.format('DD MMM YYYY')}
                        </div>
                    </div>
                    }
                    { style === 'time' &&
                    <div className="timestamp timestamp--time">
                        <div className="timestamp__instant">
                            {ts.format('HH:mm:ss')}
                        </div>
                    </div>
                    }
                    { style === 'datetime' &&
                      <div className="timestamp timestamp--time">
                          <div className="timestamp__instant">
                              {ts.format('DD MMM YYYY HH:mm:ss')}
                          </div>
                      </div>
                    }
                </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        style: props.style || 'default'
    }
}

export default connect(mapStateToProps)(Timestamp)
