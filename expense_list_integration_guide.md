# Expense List — Frontend Integration Guide

## Endpoint

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/api/v1/expenses` | Bearer JWT (required) |

---

## Query Parameters

All parameters are optional. Combine them freely.

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `page` | number | `?page=2` | Page number (default: `1`) |
| `limit` | number | `?limit=20` | Items per page, max 100 (default: `20`) |
| `month` | string | `?month=2026-05` | Filter by month — format `YYYY-MM` |
| `year` | string | `?year=2026` | Filter by full year — format `YYYY` |
| `startDate` | ISO date | `?startDate=2026-05-01` | Custom range start |
| `endDate` | ISO date | `?endDate=2026-05-31` | Custom range end (must be ≥ startDate) |
| `category` | string | `?category=Food` | One of: `Food`, `Transport`, `Utilities`, `Entertainment`, `Shopping`, `Other` |

> `month`, `year`, and `startDate/endDate` are mutually exclusive — use only one date filter at a time.

---

## Response Shape

```json
{
  "success": true,
  "message": "Expenses listed successfully",
  "data": {
    "expenses": [
      {
        "_id": "664abc123...",
        "amount": 120.00,
        "category": "Food",
        "date": "2026-05-15T00:00:00.000Z",
        "note": "Lunch at cafe",
        "userId": "663...",
        "createdAt": "2026-05-15T10:30:00.000Z",
        "updatedAt": "2026-05-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "totalItems": 87,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

Empty result (no expenses for filter) — still `200 OK`:
```json
{
  "success": true,
  "data": {
    "expenses": [],
    "pagination": {
      "totalItems": 0,
      "totalPages": 0,
      "currentPage": 1,
      "limit": 20,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

## Frontend Integration

### Vanilla JS / Fetch

```js
async function getExpenses(filters = {}) {
  const params = new URLSearchParams(
    // Strip undefined/null/empty values
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null))
  ).toString();

  const url = `/api/v1/expenses${params ? '?' + params : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch expenses');
  return response.json(); // { success, data: { expenses, pagination } }
}

// Examples
getExpenses();                                        // all, page 1
getExpenses({ month: '2026-05' });                    // May 2026
getExpenses({ year: '2026' });                        // full year
getExpenses({ category: 'Food' });                    // category only
getExpenses({ month: '2026-05', category: 'Food' });  // combined
getExpenses({ page: 2, limit: 10 });                  // pagination
getExpenses({ startDate: '2026-05-01', endDate: '2026-05-15' }); // date range
```

### React hook example

```jsx
import { useState, useEffect } from 'react';

function useExpenses(filters = {}) {
  const [data, setData]       = useState({ expenses: [], pagination: null });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null))
    ).toString();

    fetch(`/api/v1/expenses${params ? '?' + params : ''}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    })
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json.data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  return { ...data, loading, error };
}
```

### Usage in a component

```jsx
function ExpensePage() {
  const [filters, setFilters] = useState({ month: '2026-05', page: 1, limit: 20 });
  const { expenses, pagination, loading } = useExpenses(filters);

  return (
    <div>
      {/* ── Filter Bar ── */}
      <select onChange={(e) => setFilters({ ...filters, month: e.target.value, page: 1 })}>
        <option value="">All Time</option>
        <option value="2026-05">May 2026</option>
        <option value="2026-04">April 2026</option>
      </select>

      <select onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}>
        <option value="">All Categories</option>
        {['Food','Transport','Utilities','Entertainment','Shopping','Other'].map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* ── Table ── */}
      {loading ? <p>Loading...</p> : (
        <table>
          <thead>
            <tr><th>Date</th><th>Amount</th><th>Category</th><th>Note</th></tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id}>
                <td>{e.date.split('T')[0]}</td>
                <td>{e.amount.toFixed(2)}</td>
                <td>{e.category}</td>
                <td>{e.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Pagination ── */}
      {pagination && (
        <div>
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >Prev</button>

          <span> Page {pagination.currentPage} of {pagination.totalPages} </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >Next</button>
        </div>
      )}
    </div>
  );
}
```

---

## Filter Combinations Quick Reference

| Goal | Query |
|------|-------|
| All expenses | `GET /api/v1/expenses` |
| May 2026 | `?month=2026-05` |
| Full year 2026 | `?year=2026` |
| Food only | `?category=Food` |
| Food in May 2026 | `?month=2026-05&category=Food` |
| Custom range | `?startDate=2026-05-01&endDate=2026-05-15` |
| Page 3, 10 per page | `?page=3&limit=10` |
| Food, May, page 2 | `?month=2026-05&category=Food&page=2&limit=10` |

---

## Error Responses

| Status | Cause |
|--------|-------|
| `400` | Invalid query param (bad month format, invalid category, endDate before startDate) |
| `401` | Missing or expired JWT |
| `500` | Server error |

### Example 400 body
```json
{
  "success": false,
  "message": "month must be in YYYY-MM format (e.g. 2026-05)"
}
```
