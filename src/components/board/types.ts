export type TripStatus = 'out' | 'overdue' | 'returned'

export interface CallSheet {
  script: string
  missingInfo: string[]
  generatedAt: string
  source: 'ai' | 'template'
}

export interface TripData {
  vesselName: string
  vesselDescription: string
  skipper: string
  personsAboard: number
  plannedArea: string
  departedAt: string
  expectedReturnAt: string
  status: TripStatus
  checkedInAt?: string
  alertSentAt?: string
  alertCount?: number
  callSheet?: CallSheet
  isSample?: number
}

export type TripEventKind = 'departed' | 'checked_in' | 'flagged_overdue' | 'alert_sent' | 'resolved'

export interface TripEventData {
  tripId: string
  kind: TripEventKind
  detail?: string
  at: string
}

export interface WeatherData {
  location: string
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDeg: number
  description: string
  icon: string
  fetchedAt: string
}
