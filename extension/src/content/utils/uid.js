export function uid() {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
}
