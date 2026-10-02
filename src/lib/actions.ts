import { getAuthToken } from 'deepspace'

type ActionResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string }

/** POSTs to one of src/actions/index.ts's server actions, bearer-authed. */
export async function callAction<T = unknown>(
  name: string,
  params: Record<string, unknown> = {},
): Promise<ActionResult<T>> {
  const token = await getAuthToken()
  const res = await fetch(`/api/actions/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify(params),
  })
  return res.json() as Promise<ActionResult<T>>
}
