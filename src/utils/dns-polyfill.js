// Mock dns module for browser compatibility
// MongoDB uses dns for SRV record resolution
const dnsPolyfill = {
  promises: {
    resolveSrv: async (hostname) => {
      // For browser, we'll return the hostname as-is
      // MongoDB connection string parser will handle the rest
      return [{ name: hostname, port: 27017, priority: 0, weight: 0 }]
    },
    lookup: async (hostname) => {
      // Simple lookup mock
      return { address: hostname, family: 4 }
    },
  },
  resolveSrv: (hostname, callback) => {
    // Callback version
    if (callback) {
      callback(null, [{ name: hostname, port: 27017, priority: 0, weight: 0 }])
    }
  },
  lookup: (hostname, callback) => {
    if (callback) {
      callback(null, hostname, 4)
    }
  },
}

// Support both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dnsPolyfill
}
export default dnsPolyfill
