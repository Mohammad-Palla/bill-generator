// Mock dns/promises for browser compatibility
// MongoDB uses this for SRV record resolution in connection strings
const dnsPromises = {
  resolveSrv: async (hostname) => {
    // For browser, we'll return the hostname as-is
    // MongoDB connection string parser will handle the rest
    return [{ name: hostname, port: 27017, priority: 0, weight: 0 }]
  },
  lookup: async (hostname) => {
    // Simple lookup mock
    return { address: hostname, family: 4 }
  },
}

// Support both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dnsPromises
}
export default dnsPromises
