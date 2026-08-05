targetScope = 'subscription'

@description('Monthly budget amount in USD — matches the recurring Visual Studio Enterprise credit, not a hard cap Azure enforces')
param amount int = 150

@description('Email to notify when spend crosses a threshold')
param contactEmail string = 'mykal.stele@gmail.com'

@description('First-of-month start date for the budget period (Monthly time grain re-evaluates automatically every month after this)')
param startDate string = '2026-08-01T00:00:00Z'

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
      Actual_GreaterThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: [contactEmail]
      }
      Forecasted_GreaterThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: [contactEmail]
      }
    }
  }
}
