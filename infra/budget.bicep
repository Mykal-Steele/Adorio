targetScope = 'subscription'

@description('Monthly budget amount in USD — matches the recurring Visual Studio Enterprise credit, not a hard cap Azure enforces')
param amount int = 150

@description('Email to notify when spend crosses a threshold')
param contactEmail string = 'mykal.stele@gmail.com'

// utcNow() only works as a parameter default — computed at deploy time, not committed
// as a fixed value. Needed because a hardcoded date would eventually fall outside the
// "past start date must be within the current time-grain period" rule on any future
// redeploy of this same template (e.g. touching notification thresholds later).
@description('First-of-month start date for the budget period — always computed as the current month, not fixed, so redeploying this template months from now still works')
param startDate string = utcNow('yyyy-MM-01T00:00:00Z')

resource monthlyBudget 'Microsoft.Consumption/budgets@2024-08-01' = {
  name: 'adorio-monthly-credit'
  properties: {
    category: 'Cost'
    amount: amount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
    }
    notifications: {
      Actual_GreaterThan_50_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: [contactEmail]
      }
      Actual_GreaterThan_80_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: [contactEmail]
      }
      Actual_GreaterThanOrEqualTo_100_Percent: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: [contactEmail]
      }
      Forecasted_GreaterThanOrEqualTo_100_Percent: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: [contactEmail]
      }
    }
  }
}
