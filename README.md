# nRF Cloud Location Services tests [![npm version](https://img.shields.io/npm/v/@nordicsemiconductor/nrfcloud-location-services-tests.svg)](https://www.npmjs.com/package/@nordicsemiconductor/nrfcloud-location-services-tests)

[![GitHub Actions](https://github.com/NordicSemiconductor/nrfcloud-location-services-tests-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/NordicSemiconductor/nrfcloud-location-services-tests-js/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)

Tests the nRF Cloud Location services

- [Assisted GPS](https://api.nrfcloud.com/v1#tag/Assisted-GPS/operation/GetAssistanceData)
- [Predicted GPS](https://api.nrfcloud.com/v1#tag/Predicted-GPS/operation/GetPredictedAssistanceData)
- [Ground fix](https://api.nrfcloud.com/v1#tag/Ground-Fix/operation/GetLocationFromCellTowersOrWifiNetworks)

Configure these environment variables:

- `API_HOST` (optional, endpoint to run the tests against)
- `TEAM_ID`
- `AGPS_SERVICE_KEY`
- `PGPS_SERVICE_KEY`
- `GROUNDFIX_SERVICE_KEY`

Then run:

    npm ci
    npm run test

## Authentication using Evaluation Token

For evaluation purposes, users can generate an evaluation token (see the
[nRF Cloud Location Services documentation](https://docs.nrfcloud.com/AccountAndTeamManagement/AuthenticationAndAuthorization/TokensAndKeys/#evaluation-token)
for further information.)

[evaluation-token-authentication.spec.ts](./api-verification/evaluation-token-authentication.spec.ts)
demonstrates the usage of an evaluation token to authenticate requests.

For this test you need to configure the environment variable `EVALUATION_TOKEN`,
which contains your nRF Cloud Location Service Evaluation Token.

## Device Token Authentication

> :warning: Using REST with JWT on a cellular device is not recommended because
> this protocol (REST using TLS with JWT authentication) has a very large
> overhead. MQTT is recommended for cellular devices.

[device-token-authentication.spec.ts](./api-verification/device-token-authentication.spec.ts)
demonstrates the usage of per-device tokens to authenticate requests.

The tests register a private key for a virtual device and use that key to sign a
JWT.

For this test you need to configure the environment variable `API_KEY`, which
contains your nRF Cloud REST API key.
