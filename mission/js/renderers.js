(function () {
  function fmtInt(n) {
    return new Intl.NumberFormat().format(n);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function updateBanner(state) {
    setText("renderStatus", state.renderStatus);
    setText("alertState", state.alertState || "GREEN");
    setText("errorCount", String(state.errors.length));
    setText("nextRefresh", state.nextRefreshLabel || "Next refresh: pending...");
  }

  function renderLists(model) {
    const listMost = document.getElementById("listMost");
    const listBreaching = document.getElementById("listBreaching");
    listMost.innerHTML = "";
    listBreaching.innerHTML = "";

    model.topProcesses.byExceptions.forEach(function (it, i) {
      const li = document.createElement("li");
      li.className = "d-flex justify-content-between align-items-center";
      li.innerHTML = '<div class="d-flex align-items-center gap-2"><span class="badge text-bg-dark">' + (i + 1) + '</span><span>' + it.name + '</span></div><span class="kpi-pill">' + fmtInt(it.count) + ' ex</span>';
      listMost.appendChild(li);
    });

    model.topProcesses.byBreaching.forEach(function (it, i) {
      const li = document.createElement("li");
      li.className = "d-flex justify-content-between align-items-center";
      li.innerHTML = '<div class="d-flex align-items-center gap-2"><span class="badge text-bg-dark">' + (i + 1) + '</span><span>' + it.name + '</span></div><span class="d-flex align-items-center gap-2"><span class="status-badge ' + (it.level === "RED" ? 'red' : 'amber') + '">' + it.level + '</span><span class="kpi-pill">' + Math.round(it.exceptionRate * 100) + '%</span></span>';
      listBreaching.appendChild(li);
    });
  }

  function renderAlertsAndTickets(model) {
    const alertsGroupedList = document.getElementById("alertsGroupedList");
    const ticketsLane = document.getElementById("ticketsLane");
    const breachedCount = document.getElementById("alertsBreachedCount");
    const atRiskCount = document.getElementById("alertsAtRiskCount");
    const onTrackCount = document.getElementById("alertsOnTrackCount");
    const nextAction = document.getElementById("alertsNextAction");
    if (!alertsGroupedList || !ticketsLane) return;

    alertsGroupedList.innerHTML = "";
    ticketsLane.innerHTML = "";

    const grouped = {};
    model.alerts.forEach(function (a) {
      const parts = a.split(" - ");
      const alertType = parts[1] || a;
      grouped[alertType] = (grouped[alertType] || 0) + 1;
    });

    Object.keys(grouped)
      .sort(function (a, b) { return grouped[b] - grouped[a]; })
      .forEach(function (key, i) {
        const li = document.createElement("li");
        li.className = "d-flex justify-content-between align-items-center";
        li.innerHTML = '<div class="d-flex align-items-center gap-2"><span class="badge text-bg-dark">' + (i + 1) + '</span><span>' + key + '</span></div><span class="alert-count-chip">' + grouped[key] + '</span>';
        alertsGroupedList.appendChild(li);
      });

    function getSlaStatus(ticket) {
      if (ticket.days >= 20) return "breached";
      if (ticket.days >= 12) return "at-risk";
      return "on-track";
    }

    const enriched = model.tickets.map(function (t) {
      const status = getSlaStatus(t);
      const score = (status === "breached" ? 300 : (status === "at-risk" ? 150 : 0)) + t.days;
      return {
        key: t.key,
        title: t.title,
        days: t.days,
        owner: t.owner || "NA",
        lastUpdateHours: Number.isFinite(t.lastUpdateHours) ? t.lastUpdateHours : 0,
        status,
        score
      };
    }).sort(function (a, b) { return b.score - a.score; });

    const counts = enriched.reduce(function (acc, t) {
      if (t.status === "breached") acc.breached += 1;
      else if (t.status === "at-risk") acc.atRisk += 1;
      else acc.onTrack += 1;
      return acc;
    }, { breached: 0, atRisk: 0, onTrack: 0 });

    if (breachedCount) breachedCount.textContent = String(counts.breached);
    if (atRiskCount) atRiskCount.textContent = String(counts.atRisk);
    if (onTrackCount) onTrackCount.textContent = String(counts.onTrack);

    if (nextAction && enriched.length) {
      const top = enriched[0];
      nextAction.textContent = "Next action now: " + top.key + " (" + top.status.replace("-", " ") + "), owner " + top.owner + ", unresolved " + top.days + "d.";
    }

    enriched.forEach(function (t) {
      const row = document.createElement("div");
      row.className = "ticket-lane-row " + t.status;
      row.innerHTML = '<div class="ticket-lane-marker"></div>' +
        '<div><div class="ticket-lane-title">' + t.key + " - " + t.title + '</div><div class="ticket-lane-meta">Owner: ' + t.owner + " | Last update: " + t.lastUpdateHours + 'h ago</div></div>' +
        '<div class="ticket-lane-right"><span class="ticket-lane-status ' + t.status + '">' + (t.status === "at-risk" ? "At risk" : (t.status === "on-track" ? "On track" : "Breached")) + '</span><div class="ticket-lane-meta mt-1">' + t.days + "d unresolved</div></div>";
      ticketsLane.appendChild(row);
    });
  }

  function renderRobotCounts(model) {
    setText("todayRunning", fmtInt(model.robots.today.running));
    setText("todayRetired", fmtInt(model.robots.today.retired));
    setText("ydayRunning", fmtInt(model.robots.yesterday.running));
    setText("ydayRetired", fmtInt(model.robots.yesterday.retired));
  }

  function writeSummaries(summary) {
    setText("summarySlope", summary.slope);
    setText("summaryHourly", summary.hourly);
    setText("summaryDaily", summary.daily);
    setText("summaryQueueState", summary.queueState);
    setText("summaryDonut", summary.donut);
    setText("summaryDumbbell", summary.dumbbell);
    setText("summaryFunnel", summary.funnel);
    setText("summaryHeatmap", summary.heatmap);
    setText("summaryRootCause", summary.rootCause);
    setText("summarySessionOutcome", summary.sessionOutcome);
    setText("summaryQueueAging", summary.queueAging);
    setText("summaryBurst", summary.burst);
    setText("summaryScheduleActivity", summary.scheduleActivity);
  }

  function renderTimestamp(ts) {
    setText("asOf", ts);
  }

  function renderBreachFocus(items) {
    const host = document.getElementById("breachProcesses");
    if (!host) return;
    host.innerHTML = "";
    if (!items || !items.length) {
      host.innerHTML = '<span class="mini-muted">none</span>';
      return;
    }
    items.forEach(function (item) {
      const chip = document.createElement("span");
      chip.className = "breach-chip " + (item.level === "RED" ? "red" : "amber");
      chip.textContent = item.process + " (" + item.maxValue + "% exceptions)";
      host.appendChild(chip);
    });
  }

  function renderQueueAction(action) {
    const badge = document.getElementById("queueActionBadge");
    const reason = document.getElementById("queueActionReason");
    if (!badge || !reason || !action) return;

    badge.classList.remove("queue-action-required", "queue-action-watch", "queue-action-stable");
    badge.classList.add(action.levelClass);
    badge.textContent = action.label;
    reason.textContent = action.reason;
  }

  function renderExceptionsAction(action) {
    const badge = document.getElementById("exceptionsActionBadge");
    const reason = document.getElementById("exceptionsActionReason");
    if (!badge || !reason || !action) return;

    badge.classList.remove("queue-action-required", "queue-action-watch", "queue-action-stable");
    badge.classList.add(action.levelClass);
    badge.textContent = action.label;
    reason.textContent = action.reason;
  }

  function renderCriticalAnnouncements(items) {
    const host = document.getElementById("criticalAnnouncement");
    const text = document.getElementById("criticalAnnouncementText");
    if (!host || !text) return;

    text.textContent = "";
    if (!items || !items.length) {
      host.classList.add("d-none");
      return;
    }

    const top = items[0];
    text.textContent = top.title || "";
    host.classList.remove("d-none");
  }

  window.RPA = window.RPA || {};
  window.RPA.renderers = {
    updateBanner,
    renderLists,
    renderAlertsAndTickets,
    renderRobotCounts,
    writeSummaries,
    renderTimestamp,
    renderBreachFocus,
    renderCriticalAnnouncements,
    renderQueueAction,
    renderExceptionsAction
  };
})();
