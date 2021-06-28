const { get } = require("./api");
const https = require("https");
const { promisify } = require("util");

describe("PGPS", () => {
  it("should return predicted assistance GPS data", async () => {
    const res = await get("location/pgps", {
      deviceIdentifier: "TestClient",
      predictionCount: 6,
      predictionIntervalMinutes: 120,
    });
    expect(res.host).not.toBeUndefined();
    expect(res.path).not.toBeUndefined();

    const dl = await new Promise((resolve, reject) =>
      https
        .get(`https://${res.host}/${res.path}`, (res) => {
          res.on("data", (data) =>
            resolve({ statusCode: res.statusCode, headers: res.headers, data })
          );
        })
        .on("error", reject)
    );
    expect(dl.statusCode).toEqual(200);
    expect(dl.headers).toMatchObject({
      "content-type": "application/octet-stream",
    });
  });
});
