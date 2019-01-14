export async function request (requestInfo, requestInit) {
  const resp = await fetch(requestInfo, requestInit)
  const body = await resp.json()
  return body
}
