export function isDevMockMode(): boolean {
  return process.env.DEV_ALLOW_MOCK_AUTH === "true";
}
