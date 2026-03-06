import { ChartConfig } from "./ChartContext";

export function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined;
  const pl = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : undefined;
  let labelKey: string = key;
  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    labelKey = payload[key as keyof typeof payload] as string;
  } else if (pl && key in pl && typeof pl[key as keyof typeof pl] === "string") {
    labelKey = pl[key as keyof typeof pl] as string;
  }
  return labelKey in config ? config[labelKey] : config[key as keyof typeof config];
}
