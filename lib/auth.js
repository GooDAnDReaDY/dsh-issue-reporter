export async function clearGitHubCredential(credentials, ref) {
  if (!ref || typeof credentials?.unset !== 'function') {
    throw new Error('DSH credentials service cannot remove GitHub authorization')
  }
  await credentials.unset(ref)
}
