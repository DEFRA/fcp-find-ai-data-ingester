const { Contracts } = require('applicationinsights')

const pinoLevelToSeverityLevel = (level) => {
  if (level === 10 || level === 20) {
    return Contracts.SeverityLevel.Verbose
  }

  if (level === 40) {
    return Contracts.SeverityLevel.Warning
  }

  if (level === 50) {
    return Contracts.SeverityLevel.Error
  }

  if (level === 60) {
    return Contracts.SeverityLevel.Critical
  }

  return Contracts.SeverityLevel.Information
}

module.exports = { pinoLevelToSeverityLevel }
