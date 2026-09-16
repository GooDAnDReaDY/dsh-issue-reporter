const warnedContexts = new WeakSet()

export function logOptionalFailure(ctx, operation) {
  ctx?.logger?.debug?.('dsh-issue-reporter: ' + operation + ' unavailable; continuing with fallback')
}

function writeJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}

function warnAuthUnavailable(ctx) {
  if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function') || warnedContexts.has(ctx)) return
  warnedContexts.add(ctx)
  ctx.logger?.warn?.('dsh-issue-reporter: DSH connection authorization service is unavailable')
}

export function authorizeRequest(ctx, req, res) {
  let connection
  try {
    connection = ctx.reflect?.get?.('connection')
  } catch {
    warnAuthUnavailable(ctx)
    writeJson(res, 503, { ok: false, error: 'DSH browser authentication is unavailable' })
    return false
  }

  if (!connection || typeof connection.requestRejection !== 'function') {
    warnAuthUnavailable(ctx)
    writeJson(res, 503, { ok: false, error: 'DSH browser authentication is unavailable' })
    return false
  }

  let rejection
  try {
    rejection = connection.requestRejection(req)
  } catch {
    warnAuthUnavailable(ctx)
    writeJson(res, 503, { ok: false, error: 'DSH browser authentication is unavailable' })
    return false
  }

  if (rejection !== undefined) {
    const status = rejection === 401 ? 401 : 403
    writeJson(res, status, {
      ok: false,
      error: status === 401 ? 'DSH browser authentication is required' : 'Trusted same-origin request required',
    })
    return false
  }

  return true
}
