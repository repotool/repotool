export default (moduleName: string): boolean => {
  try {
    // We only resolve the plugin, because if we required it here it might
    // itself include a missing module throwing a MODULE_NOT_FOUND error and
    // thereby creating a false positive.
    require.resolve(moduleName)
  } catch (err) {
    if (typeof err === 'object' && err.code === 'MODULE_NOT_FOUND') {
      return false
    } else {
      throw err
    }
  }

  return true
}
