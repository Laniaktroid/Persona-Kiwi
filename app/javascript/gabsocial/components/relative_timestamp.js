import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'

const dateFormatOptions = {
  hour12: false,
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}

const shortDateFormatOptions = {
  month: 'short',
  day: 'numeric',
}

const SECOND = 1000
const MINUTE = 1000 * 60
const HOUR = 1000 * 60 * 60
const DAY = 1000 * 60 * 60 * 24

const MAX_DELAY = 2147483647

const selectUnits = delta => {
  const absDelta = Math.abs(delta)

  if (absDelta < MINUTE) {
    return 'second'
  } else if (absDelta < HOUR) {
    return 'minute'
  } else if (absDelta < DAY) {
    return 'hour'
  }

  return 'day'
}

const getUnitDelay = units => {
  switch (units) {
  case 'second':
    return SECOND
  case 'minute':
    return MINUTE
  case 'hour':
    return HOUR
  case 'day':
    return DAY
  default:
    return MAX_DELAY
  }
}

export const timeAgoString = (intl, date, now, year) => {
  const delta = now - date.getTime()

  if (delta < 10 * SECOND) {
    return intl.formatMessage(messages.just_now)
  } else if (delta < 7 * DAY) {
    if (delta < MINUTE) {
      return intl.formatMessage(messages.seconds, { number: Math.floor(delta / SECOND) })
    } else if (delta < HOUR) {
      return intl.formatMessage(messages.minutes, { number: Math.floor(delta / MINUTE) })
    } else if (delta < DAY) {
      return intl.formatMessage(messages.hours, { number: Math.floor(delta / HOUR) })
    } else {
      return intl.formatMessage(messages.days, { number: Math.floor(delta / DAY) })
    }
  } else if (date.getFullYear() === year) {
    return intl.formatDate(date, shortDateFormatOptions)
  }

  return intl.formatDate(date, { ...shortDateFormatOptions, year: 'numeric' })
}

const timeRemainingString = (intl, date, now) => {
  const delta = date.getTime() - now

  if (delta < 10 * SECOND) {
    return intl.formatMessage(messages.moments_remaining)
  } else if (delta < MINUTE) {
    return intl.formatMessage(messages.seconds_remaining, { number: Math.floor(delta / SECOND) })
  } else if (delta < HOUR) {
    return intl.formatMessage(messages.minutes_remaining, { number: Math.floor(delta / MINUTE) })
  } else if (delta < DAY) {
    return intl.formatMessage(messages.hours_remaining, { number: Math.floor(delta / HOUR) })
  }

  return intl.formatMessage(messages.days_remaining, { number: Math.floor(delta / DAY) })
}

class RelativeTimestamp extends React.Component {

  state = {
    now: this.props.intl.now(),
  }

  static defaultProps = {
    year: (new Date()).getFullYear(),
  }

  shouldComponentUpdate(nextProps, nextState) {
    // As of right now the locale doesn't change without a new page load,
    // but we might as well check in case that ever changes.
    return this.props.timestamp !== nextProps.timestamp ||
      this.props.intl.locale !== nextProps.intl.locale ||
      this.state.now !== nextState.now
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.timestamp !== nextProps.timestamp) {
      this.setState({ now: this.props.intl.now() })
    }
  }

  componentDidMount() {
    this._scheduleNextUpdate(this.props, this.state)
  }

  componentDidUpdate(nextProps, nextState) {
    this._scheduleNextUpdate(nextProps, nextState)
  }

  componentWillUnmount() {
    clearTimeout(this._timer)
  }

  _scheduleNextUpdate(props, state) {
    clearTimeout(this._timer)

    const { timestamp } = props
    const delta = (new Date(timestamp)).getTime() - state.now
    const unitDelay = getUnitDelay(selectUnits(delta))
    const unitRemainder = Math.abs(delta % unitDelay)
    const updateInterval = 1000 * 10
    const delay = delta < 0 ? Math.max(updateInterval, unitDelay - unitRemainder) : Math.max(updateInterval, unitRemainder)

    this._timer = setTimeout(() => {
      this.setState({ now: this.props.intl.now() })
    }, delay)
  }

  render() {
    const { timestamp, intl, year, futureDate } = this.props

    const date = new Date(timestamp)
    const relativeTime = futureDate ? timeRemainingString(intl, date, this.state.now) : timeAgoString(intl, date, this.state.now, year)

    return (
      <time dateTime={timestamp} title={intl.formatDate(date, dateFormatOptions)}>
        {relativeTime}
      </time>
    )
  }

}

const messages = defineMessages({
  just_now: { id: 'relative_time.just_now', defaultMessage: 'now' },
  seconds: { id: 'relative_time.seconds', defaultMessage: '{number}s' },
  minutes: { id: 'relative_time.minutes', defaultMessage: '{number}m' },
  hours: { id: 'relative_time.hours', defaultMessage: '{number}h' },
  days: { id: 'relative_time.days', defaultMessage: '{number}d' },
  moments_remaining: { id: 'time_remaining.moments', defaultMessage: 'Moments remaining' },
  seconds_remaining: { id: 'time_remaining.seconds', defaultMessage: '{number, plural, one {# second} other {# seconds}} left' },
  minutes_remaining: { id: 'time_remaining.minutes', defaultMessage: '{number, plural, one {# minute} other {# minutes}} left' },
  hours_remaining: { id: 'time_remaining.hours', defaultMessage: '{number, plural, one {# hour} other {# hours}} left' },
  days_remaining: { id: 'time_remaining.days', defaultMessage: '{number, plural, one {# day} other {# days}} left' },
})

RelativeTimestamp.propTypes = {
  intl: PropTypes.object.isRequired,
  timestamp: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  futureDate: PropTypes.bool,
}

export default injectIntl(RelativeTimestamp)
