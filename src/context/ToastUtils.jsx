// Example utilities — you decide what to keep here

export const toastTypes = {
  INFO: "info",
  ERROR: "error",
  SUCCESS: "success",
};

export function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
