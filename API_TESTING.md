# API Testing

## Comments API

### Test POST /api/comments

```bash
curl -X POST http://localhost:4321/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "test-article-id",
    "author_name": "Test User",
    "author_email": "test@example.com",
    "content": "This is a test comment"
  }'
```

### Expected Response
- Status: 201 (success) or 400/500 (error)
- Body: JSON with success/error message

## Newsletter API

### Test POST /api/newsletter

```bash
curl -X POST http://localhost:4321/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Expected Response
- Status: 201 (success) or 400/500 (error)
- Body: JSON with success/error message