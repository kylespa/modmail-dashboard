const locale = navigator.language || 'en-US'

// Whether the browser language puts the day before the month
const detectDateOrder = () => {
  try {
    const types = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' })
      .formatToParts(new Date()).map(p => p.type)
    return types.indexOf('day') < types.indexOf('month') ? 'dmy' : 'mdy'
  } catch {
    return 'mdy'
  }
}

// Whether the browser language uses a 12 or 24 hour clock
const detectHourCycle = () => {
  try {
    const { hourCycle, hour12 } = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
    if (hourCycle) return hourCycle === 'h11' || hourCycle === 'h12' ? '12' : '24'
    return hour12 === false ? '24' : '12'
  } catch {
    return '12'
  }
}

export const AUTO_DATE = detectDateOrder()
export const AUTO_TIME = detectHourCycle()

export const DATE_FORMATS = {
  mdy: 'MMMM d, yyyy', // November 20, 2026
  dmy: 'd MMMM yyyy' // 20 November 2026
}

export const TIME_FORMATS = {
  12: 'h:mm a', // 3:45 PM
  24: 'HH:mm' // 15:45
}

const resolve = (value, auto) => value === 'auto' ? auto : value

export const dateFormat = settings => DATE_FORMATS[resolve(settings.dateFormat, AUTO_DATE)] || DATE_FORMATS[AUTO_DATE]
export const timeFormat = settings => TIME_FORMATS[resolve(settings.timeFormat, AUTO_TIME)] || TIME_FORMATS[AUTO_TIME]
export const dateTimeFormat = settings => `${dateFormat(settings)} ${timeFormat(settings)}`
