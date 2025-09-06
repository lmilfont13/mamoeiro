import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { CreateContainerSchema, UpdateContainerSchema } from "../shared/types";

const app = new Hono<{ Bindings: Env }>();

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Container endpoints
app.get('/api/containers', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM containers WHERE user_id = ? ORDER BY expected_arrival_date ASC, created_at DESC'
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/containers', authMiddleware, zValidator('json', CreateContainerSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const { success } = await c.env.DB.prepare(`
    INSERT INTO containers (
      user_id, container_number, departure_port, arrival_port, 
      departure_date, expected_arrival_date, status, cargo_description,
      tracking_number, shipping_line, notes, product_images, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    user.id,
    data.container_number,
    data.departure_port,
    data.arrival_port,
    data.departure_date || null,
    data.expected_arrival_date || null,
    data.status,
    data.cargo_description || null,
    data.tracking_number || null,
    data.shipping_line || null,
    data.notes || null,
    data.product_images || null
  ).run();

  if (!success) {
    return c.json({ error: 'Failed to create container' }, 500);
  }

  return c.json({ success: true }, 201);
});

app.put('/api/containers/:id', authMiddleware, zValidator('json', UpdateContainerSchema), async (c) => {
  const user = c.get('user');
  const containerId = c.req.param('id');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const updates = [];
  const bindings = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      bindings.push(value);
    }
  });

  if (updates.length === 0) {
    return c.json({ error: 'No updates provided' }, 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  bindings.push(user.id, containerId);

  const { success } = await c.env.DB.prepare(`
    UPDATE containers 
    SET ${updates.join(', ')} 
    WHERE user_id = ? AND id = ?
  `).bind(...bindings).run();

  if (!success) {
    return c.json({ error: 'Failed to update container' }, 500);
  }

  return c.json({ success: true });
});

app.delete('/api/containers/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const containerId = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const { success } = await c.env.DB.prepare(
    'DELETE FROM containers WHERE user_id = ? AND id = ?'
  ).bind(user.id, containerId).run();

  if (!success) {
    return c.json({ error: 'Failed to delete container' }, 500);
  }

  return c.json({ success: true });
});

export default app;
