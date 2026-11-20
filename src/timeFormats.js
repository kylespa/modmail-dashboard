export const DATE_FORMATS = {
  mdy: 'MMMM d, yyyy', // November 20, 2026
  dmy: 'd MMMM yyyy' // 20 November 2026
}

export const TIME_FORMATS = {
  12: 'h:mm a', // 3:45 PM
  24: 'HH:mm' // 15:45
}

export const dateFormat = settings => DATE_FORMATS[settings.dateFormat] || DATE_FORMATS.mdy
export const timeFormat = settings => TIME_FORMATS[settings.timeFormat] || TIME_FORMATS[12]
export const dateTimeFormat = settings => `${dateFormat(settings)} ${timeFormat(settings)}`
