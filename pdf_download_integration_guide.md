# PDF Download — Frontend Integration Guide

## Endpoint

| Method | URL | Auth |
|--------|-----|------|
| `GET` | `/api/v1/expenses/export/pdf` | Bearer JWT (required) |

---

## What the PDF contains

A clean, paginated transaction table — nothing else. No banner, no summary cards, no category charts.

Columns in the table:

| Column | Format | Example |
|--------|--------|---------|
| No. | Row index | `1` |
| Date | `YYYY-MM-DD` (UTC) | `2026-05-15` |
| Amount | Decimal, 2 places | `99.00` |
| Category | Text | `Shopping` |
| Note | Text (truncated at 60 chars) | `Bought shoes` |

If there are no expenses for the filter, the PDF contains the header row and a single "No records found" message row.

The table header repeats on every page for multi-page exports.

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
async function downloadPDF(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const url = `/api/v1/expenses/export/pdf${params ? '?' + params : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });

  if (!response.ok) throw new Error('PDF export failed: ' + response.status);

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'expenses.pdf'; // browser will use Content-Disposition if set
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

// Examples
downloadPDF();                                          // all time
downloadPDF({ month: '2026-05' });                     // May 2026
downloadPDF({ year: '2026' });                         // full year
downloadPDF({ startDate: '2026-05-01', endDate: '2026-05-15' }); // range
downloadPDF({ month: '2026-05', category: 'Food' });   // filtered
```

### React (with axios)

```jsx
import axios from 'axios';

const exportPDF = async (filters = {}) => {
  const response = await axios.get('/api/v1/expenses/export/pdf', {
    params: filters,
    headers: { Authorization: 'Bearer ' + token },
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.pdf';
  a.click();
  URL.revokeObjectURL(url);
};
```

### Button example

```jsx
<button onClick={() => exportPDF({ month: '2026-05' })}>
  Download PDF
</button>
```

---

## Response Headers

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="SpendAI_Report_2026-05.pdf"
Content-Length: <bytes>
```

The filename is auto-generated from the active filters (e.g. `SpendAI_Report_2026-05_food.pdf`).

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid JWT |
| `500` | Server error (pdfkit failure, DB error) |
