export function getTodayDrawDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function getNextDrawAtIso(): string {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}
