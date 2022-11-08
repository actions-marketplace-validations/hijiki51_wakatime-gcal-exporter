import {JSONClient} from 'google-auth-library/build/src/auth/googleauth'
import {formatRFC3339} from 'date-fns'
import {google} from 'googleapis'
import {GoogleAuth} from 'google-auth-library'
import {debug} from '@actions/core'

export const insertToGcal = async (
  auth: GoogleAuth<JSONClient>,
  calenderId: string,
  colorId: string,
  title: string,
  start: Date,
  end: Date
): Promise<void> => {
  try {
    const calender = google.calendar({version: 'v3', auth})
    const startDate = formatRFC3339(start)
    const endDate = formatRFC3339(end)

    await calender.events.insert({
      calendarId: calenderId,
      requestBody: {
        colorId,
        summary: title,
        start: {
          dateTime: startDate
        },
        end: {
          dateTime: endDate
        }
      }
    })
  } catch (error) {
    if (error instanceof Error) debug(`insert failed: ${error.message}`)
  }
}

export const authorize = async (
  content: string
): Promise<GoogleAuth<JSONClient>> => {
  try {
    const credential = JSON.parse(content)
    const client = new google.auth.JWT(
      credential.client_email,
      undefined,
      credential.private_key,
      ['https://www.googleapis.com/auth/calendar']
    )
    await client.authorize()

    return new google.auth.GoogleAuth({
      authClient: client
    })
  } catch (error) {
    throw new Error('Invalid credential json')
  }
}
