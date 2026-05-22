# CSV Export — Frontend Integration Guide

## Endpoint

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/api/v1/expenses/export` | Bearer JWT (required) |

---

## What the CSV contains

The file is a clean, flat transaction list — nothing else. No summary blocks, no category breakdowns, no footers.

```
No.,Date,Amount,Category,Note
1,2026-05-01,120.00,"Food","Lunch at cafe"
2,2026-05-03,45.50,"Transport","Uber ride"
```

Columns:

| Column | Format | Example |
|--------|--------|---------|
| No. | Integer row index | `1` |
| Date | `YYYY-MM-DD` (UTC) | `2026-05-15` |
| Amount | Decimal, 2 places | `99.00` |
| Category | Quoted string | `"Shopping"` |
| Note | Quoted string | `"Bought shoes"` |

If there are no expenses for the filter, the file contains only the header row — no error, no phantom rows.

---

## Query Parameters (all optional)

| Parameter | Example | Effect |
|-----------|---------|--------|
| `month` | `?month=2026-05` | Transactions in May 2026 only |
| `year` | `?year=2026` | All transactions in 2026 |
| `startDate` + `endDate` | `?startDate=2026-05-01&endDate=2026-05-15` | Custom date range |
| `category` | `?category=Food` | Filter by category |

Omit all date params to export every transaction.

---

## Frontend Integration

### Vanilla JS / Fetch

```js
async function downloadCSV(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const url = `/api/v1/expenses/export${params ? '?' + params : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });

  if (!response.ok) throw new Error('Export failed: ' + response.status);

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'expenses.csv'; // browser will use Content-Disposition if set
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

// Examples
downloadCSV();                                          // all time
downloadCSV({ month: '2026-05' });                     // May 2026
downloadCSV({ year: '2026' });                         // full year
downloadCSV({ startDate: '2026-05-01', endDate: '2026-05-15' }); // range
downloadCSV({ month: '2026-05', category: 'Food' });   // filtered
```

### React (with axios)

```jsx
import axios from 'axios';

const exportCSV = async (filters = {}) => {
  const response = await axios.get('/api/v1/expenses/export', {
    params: filters,
    headers: { Authorization: 'Bearer ' + token },
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  a.click();
  URL.revokeObjectURL(url);
};
```

### Button example

```jsx
<button onClick={() => exportCSV({ month: '2026-05' })}>
  Download CSV
</button>
```

---

## Response Headers

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="SpendAI_Expenses_2026-05.csv"
```

The filename is auto-generated from the active filters (e.g. `SpendAI_Expenses_2026-05_food.csv`).

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid JWT |
| `500` | Server error |
