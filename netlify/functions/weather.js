const endpointByType = {
  air: "https://api.openweathermap.org/data/2.5/air_pollution",
  current: "https://api.openweathermap.org/data/2.5/weather",
  forecast: "https://api.openweathermap.org/data/2.5/forecast",
};

exports.handler = async (event) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return json(500, { message: "OPENWEATHER_API_KEY is not configured." });
  }

  const params = event.queryStringParameters || {};
  const endpoint = endpointByType[params.type];

  if (!endpoint) {
    return json(400, { message: "Invalid weather request type." });
  }

  const upstreamParams = new URLSearchParams({
    appid: apiKey,
  });

  if (params.type !== "air") {
    upstreamParams.set("units", "metric");
  }

  if (params.q) {
    upstreamParams.set("q", params.q);
  } else if (params.lat && params.lon) {
    upstreamParams.set("lat", params.lat);
    upstreamParams.set("lon", params.lon);
  } else {
    return json(400, { message: "City or coordinates are required." });
  }

  try {
    const response = await fetch(`${endpoint}?${upstreamParams}`);
    const data = await response.json();
    return json(response.status, data);
  } catch {
    return json(502, { message: "Unable to reach weather service." });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120",
    },
    body: JSON.stringify(body),
  };
}
