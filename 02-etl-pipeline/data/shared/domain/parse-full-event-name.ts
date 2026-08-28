interface ParsedEventNames {
  seriesName: string;
  headlineName: string;
}

export function parseFullEventName(eventName: string): ParsedEventNames {
  const separatorIndex = eventName.indexOf(":");

  if (separatorIndex === -1) {
    return {
      seriesName: eventName.trim(),
      headlineName: "",
    };
  }

  const seriesName = eventName.slice(0, separatorIndex).trim();
  const headlineName = eventName.slice(separatorIndex + 1).trim();

  return { seriesName, headlineName };
}
