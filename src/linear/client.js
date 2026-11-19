import { safeFact } from './document.js';

const query = 'query SyncIssue($id: String!) { issue(id: $id) { identifier state { name } assignee { name } } }';

/** No mutations or server-provided error text ever leave this client. */
export async function fetchIssues(ids, { apiKey, fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  if (!apiKey || /[\r\n]/.test(apiKey)) throw new Error('Invalid Linear API key');
  const issues = new Map();
  const errors = [];
  let stopped = null;
  for (const id of new Set(ids)) {
    if (stopped) { errors.push({ id, message: stopped }); continue; }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl('https://api.linear.app/graphql', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: apiKey },
        body: JSON.stringify({ query, variables: { id } }), signal: controller.signal, redirect: 'error',
      });
      if (!response.ok) {
        const message = `HTTP ${response.status}`;
        if ([401, 403, 429].includes(response.status)) stopped = message;
        errors.push({ id, message });
        continue;
      }
      const payload = await response.json();
      const issue = payload?.data?.issue;
      if (payload?.errors?.length || !issue || issue.identifier !== id || !safeFact(issue.state?.name)
        || (issue.assignee !== null && !safeFact(issue.assignee?.name))) {
        errors.push({ id, message: 'Missing issue, GraphQL error or invalid ticket fields' });
        continue;
      }
      issues.set(id, { status: issue.state.name, owner: issue.assignee?.name ?? null });
    } catch {
      errors.push({ id, message: controller.signal.aborted ? 'Request timed out' : 'Network or response error' });
    } finally { clearTimeout(timer); }
  }
  return { issues, errors };
}
