// Storage cleaner utility
class StorageCleaner {
  // Get total localStorage size in bytes
  getTotalSize() {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }

  // Get size in MB
  getSizeMB() {
    return (this.getTotalSize() / 1024 / 1024).toFixed(2)
  }

  // Check if storage is nearly full (>80% of 5MB)
  isNearlyFull() {
    const sizeMB = parseFloat(this.getSizeMB())
    return sizeMB > 4 // Assuming 5MB limit
  }

  // Clear all SignaturePro data
  clearAll() {
    localStorage.removeItem('signaturepro_signatures')
    localStorage.removeItem('signaturepro_watermarks')
  }

  // Get storage info
  getInfo() {
    const signatures = JSON.parse(localStorage.getItem('signaturepro_signatures') || '[]')
    const watermarks = JSON.parse(localStorage.getItem('signaturepro_watermarks') || '[]')
    
    return {
      totalSizeMB: this.getSizeMB(),
      signatures: signatures.length,
      watermarks: watermarks.length,
      isNearlyFull: this.isNearlyFull()
    }
  }

  // Test if we can save data
  async canSave(testData = 'test') {
    try {
      const testKey = '_storage_test_'
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }
}

export default new StorageCleaner()
