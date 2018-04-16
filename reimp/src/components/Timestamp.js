import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

export class Timestamp extends Component {

    render() {
    const { format, value } = this.props
    const ts = moment(value)
    const tsToolTip = moment(value).format('D MMM YYYY, kk:mm')

    return (
        <div className="timestamp__wrapper" data-tip={tsToolTip}>
          { value &&
            <div className="timestamp__container">
              { format === 'default' &&
                <div className="timestamp timestamp--default">
                  <div className="timestamp__instant">
                    {ts.format('LLLL')}
                  </div>
                  <div className="timestamp__description">
                    {ts.fromNow()}
                  </div>
                </div>
              }
              { format === 'precise' &&
                <div className="timestamp timestamp--precise">
                  <div className="timestamp__instant">
                    {ts.format('h:mm:ss a')}
                  </div>
                </div>
              }
              { format === 'short-time' &&
                <div className="timestamp timestamp--precise">
                  <div className="timestamp__instant">
                    {ts.format('h:mm')}
                  </div>
                </div>
              }
              { format === 'short-date' &&
                <div className="timestamp timestamp--precise">
                  <div className="timestamp__instant">
                    {ts.format('D MMM')}
                  </div>
                </div>
              }
              { format === 'date' &&
                <div className="timestamp timestamp--date">
                  <div className="timestamp__instant">
                    {ts.format('DD MMM YYYY')}
                  </div>
                </div>
              }
              { format === 'time' &&
                <div className="timestamp timestamp--time">
                  <div className="timestamp__instant">
                    {ts.format('HH:mm:ss')}
                  </div>
                </div>
              }
              { format === 'datetime' &&
                <div className="timestamp timestamp--time">
                  <div className="timestamp__instant">
                    {ts.format('DD MMM YYYY HH:mm:ss')}
                  </div>
                </div>
              }
              { format === 'dateshort-time' &&
                <div className="timestamp timestamp--time">
                  <div className="timestamp__instant">
                    {ts.format('DD MMM YYYY HH:mm')}
                  </div>
                </div>
              }
              { format === 'from_now' &&
                <div className="timestamp timestamp--time">
                  <div className="timestamp__fromnow">
                    {ts.fromNow()}
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
        value: props.value,
        format: props.format || 'default'
    }
}

export default connect(mapStateToProps)(Timestamp)
