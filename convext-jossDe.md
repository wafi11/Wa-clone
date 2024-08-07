# Task Management API

This document describes the API endpoints for managing tasks, including fetching, adding, completing, and deleting tasks. The functions use Convex's server-side utilities for interacting with the database.

## Get Tasks

Fetch all tasks from the database.

### Endpoint

```tsx
import { query } from "./_generated/server";

export const getTasks = query({
  args: {},
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks;
  },
});
```
