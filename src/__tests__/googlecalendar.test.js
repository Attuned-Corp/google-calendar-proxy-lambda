const GoogleCalendar = require('../googlecalendar').GoogleCalendar

describe('GoogleCalendar', () => {
  let googleCalendar
  beforeEach(() => {
    googleCalendar = new GoogleCalendar(
      null,
      "test-calendar-id",
      ["test.com"],
      "hash-secret"
    )
  });

  test('redactEmail if in allow list should do nothing', () => {
    const input = "example@test.com"
    const redactedEmail = googleCalendar._redactEmail(input)
    expect(redactedEmail).toEqual(input)
  })

  test('redactEmail if not in allow list should hash it', () => {
    const input = "example@different_test.com"
    const redactedEmail = googleCalendar._redactEmail(input)
    expect(redactedEmail).toEqual(expect.not.stringContaining(input))
  })

  test('redactEvent', () => {
    const input = {
      summary: "Sensitive summary",
      description: "Sensitive info about company private.com/info"
    }

    const redactedEvent = googleCalendar._redactEvent(input)
    expect(redactedEvent).toEqual({
      summary: "<REDACTED>",
      description: ""
    })
  })

  test('redactEvent with recruiting link to preserve', () => {
    const input = {
      summary: "Sensitive summary",
      description: "Sensitive info about company private.com/info something.ashbyhq.com/link greenhouse.io/example"
    }

    const redactedEvent = googleCalendar._redactEvent(input)
    expect(redactedEvent).toEqual({
      summary: "<REDACTED>",
      description: "greenhouse.io/example something.ashbyhq.com/link"
    })
  })
})