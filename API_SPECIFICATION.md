# PayID Address Book Search API

This API allows the frontend application to search a customer's saved PayID address book by name, nickname, or PayID (email, mobile number, or ABN). It returns all matching payees for a given query.

## Endpoint

`GET /api/payees/search`

---

## Query Parameters

| Parameter | Type   | Required | Description                                                                    |
| --------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `q`       | string | Yes      | The search term entered by the user. Matching is case-insensitive and partial. |

---

## Matching Rules

The API performs a **case-insensitive partial match** of the query against the following fields:

- `payeeName`
- `nickname`
- `payID`
  - For mobile numbers, the API strips all non-digit characters before matching.
  - E.g., `"0412784539"`, `"0412 784 539"`, `"0412-784-539"` will all match the same entry.

---

## Behaviour

- If `q.length < 1`: return `400 Bad Request`
- Otherwise: return **all matching payees** (no truncation)
- The frontend is responsible for:
  - Displaying **search suggestions** after 3+ characters (up to 10)
  - Displaying the full result list after search submission

---

## Response Format

```json
{
  "results": [
    {
      "payeeName": "Alexandra Smith",
      "payID": "a.smith@example.com",
      "payIDType": "email",
      "nickname": "Lexi"
    }
  ]
}
```

---

## Example Requests and Responses

### Request

```
GET /api/payees/search?q=alex
```

### Response (Multiple Matches)

```json
{
  "results": [
    {
      "payeeName": "Alexandra Smith",
      "payID": "a.smith@example.com",
      "payIDType": "email",
      "nickname": "Lexi"
    },
    {
      "payeeName": "Alex Wilson",
      "payID": "alex.w@example.com",
      "payIDType": "email",
      "nickname": null
    }
  ]
}
```

---

### Response (Mobile Number Match)

```json
{
  "results": [
    {
      "payeeName": "Andy Bolton",
      "payID": "0412 784 539",
      "payIDType": "mobile",
      "nickname": "AndyB"
    }
  ]
}
```

---

### Response (No Matches)

```json
{
  "results": []
}
```

---

## Error Responses

### Missing or Empty Query

```http
GET /api/payees/search
```

**Response:**

```json
{
  "error": "Missing or empty search query"
}
```

**Status:** `400 Bad Request`

---

## Notes

- The API does not return truncated lists or suggestions — it always returns **the full filtered result set**.
- All presentation logic (e.g. showing top 10 suggestions, formatting, grouping) is handled on the **frontend**.
