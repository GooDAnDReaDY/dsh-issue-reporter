export function detectTicketChanges(prev = {}, next = {}) {
  const prevComments = Number.isFinite(prev.comments) ? prev.comments : 0
  const nextComments = Number.isFinite(next.comments) ? next.comments : 0
  const prevStatus = String(prev.state || "open").toLowerCase()
  const nextStatus = String(next.state || "open").toLowerCase()

  const statusChanged = prevStatus !== nextStatus
  const newCommentsCount = Math.max(0, nextComments - prevComments)
  const authorReplied = Boolean(next.authorReplied || (newCommentsCount > 0 && next.lastCommentByAuthor))

  let summary = "No changes detected"
  if (statusChanged && nextStatus === "closed") {
    summary = "Issue was closed by maintainer"
  } else if (statusChanged && nextStatus === "open") {
    summary = "Issue was reopened"
  } else if (authorReplied) {
    summary = "Author / maintainer replied to the report"
  } else if (newCommentsCount > 0) {
    summary = `Received ${newCommentsCount} new comment(s)`
  }

  return {
    changed: statusChanged || newCommentsCount > 0 || authorReplied,
    statusChanged,
    previousStatus: prevStatus,
    currentStatus: nextStatus,
    newCommentsCount,
    authorReplied,
    summary,
  }
}

export function formatPulseAlertMarkdown(alert = {}) {
  const {
    ticketNumber,
    repo,
    type = "update",
    summary = "Status updated",
    url,
    timestamp = new Date().toISOString(),
  } = alert

  const badge = type === "author_reply" ? "💬 Author Replied" :
    type === "closed" ? "✅ Issue Resolved" :
    type === "reopened" ? "🔄 Issue Reopened" : "ℹ️ Ticket Update"

  return [
    `### Status Pulse: ${badge}`,
    `- **Repository**: \`${repo || "unknown"}\``,
    `- **Issue**: [#${ticketNumber || "?"}](${url || "#"})`,
    `- **Event**: ${summary}`,
    `- **Checked at**: \`${timestamp}\``,
  ].join("\n")
}

export class StatusPulseTracker {
  constructor(options = {}) {
    this.pollIntervalMs = options.pollIntervalMs || 25 * 60 * 1000
    this.maxTracked = options.maxTracked || 50
    this.tracked = new Map()
    this.alerts = []
    this.maxAlerts = options.maxAlerts || 30
    this.fetchFn = options.fetchFn || null
    this.timer = null
  }

  trackTicket(ticket = {}) {
    if (!ticket || !ticket.id) return null
    const entry = {
      id: String(ticket.id),
      number: ticket.number,
      repo: ticket.repo,
      title: ticket.title || "",
      state: String(ticket.state || "open").toLowerCase(),
      comments: Number.isFinite(ticket.comments) ? ticket.comments : 0,
      url: ticket.url || "",
      tracker: ticket.tracker || "github",
      lastChecked: new Date().toISOString(),
      author: ticket.author || "",
      lastCommentByAuthor: Boolean(ticket.lastCommentByAuthor),
    }

    if (this.tracked.size >= this.maxTracked && !this.tracked.has(entry.id)) {
      const oldestKey = this.tracked.keys().next().value
      if (oldestKey) this.tracked.delete(oldestKey)
    }

    this.tracked.set(entry.id, entry)
    return entry
  }

  untrackTicket(id) {
    return this.tracked.delete(String(id))
  }

  getTrackedTicket(id) {
    return this.tracked.get(String(id)) || null
  }

  listTrackedTickets() {
    return Array.from(this.tracked.values())
  }

  recordAlert(alert) {
    this.alerts.unshift({
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: alert.timestamp || new Date().toISOString(),
    })
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.length = this.maxAlerts
    }
  }

  getAlerts() {
    return [...this.alerts]
  }

  clearAlerts() {
    this.alerts = []
  }

  async pollAll(fetchStatusFn = this.fetchFn) {
    if (typeof fetchStatusFn !== "function") return []
    const generatedAlerts = []

    for (const [id, current] of this.tracked.entries()) {
      try {
        const fresh = await fetchStatusFn(current)
        if (!fresh) continue

        const changes = detectTicketChanges(current, fresh)
        if (changes.changed) {
          const type = changes.statusChanged
            ? (changes.currentStatus === "closed" ? "closed" : "reopened")
            : (changes.authorReplied ? "author_reply" : "new_comment")

          const alert = {
            ticketId: id,
            ticketNumber: current.number,
            repo: current.repo,
            url: fresh.url || current.url,
            type,
            summary: changes.summary,
            changes,
          }

          this.recordAlert(alert)
          generatedAlerts.push(alert)

          this.tracked.set(id, {
            ...current,
            state: fresh.state || current.state,
            comments: Number.isFinite(fresh.comments) ? fresh.comments : current.comments,
            lastChecked: new Date().toISOString(),
            lastCommentByAuthor: Boolean(fresh.lastCommentByAuthor),
          })
        }
      } catch (err) {
        void err
      }
    }

    return generatedAlerts
  }
}
