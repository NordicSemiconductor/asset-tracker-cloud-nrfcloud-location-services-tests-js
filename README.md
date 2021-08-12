# nRF Cloud Location Services tests [![npm version](https://img.shields.io/npm/v/@nordicsemiconductor/nrfcloud-location-services-tests.svg)](https://www.npmjs.com/package/@nordicsemiconductor/nrfcloud-location-services-tests)

[![GitHub Actions](https://github.com/NordicSemiconductor/nrfcloud-location-services-tests-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/NordicSemiconductor/nrfcloud-location-services-tests-js/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/NordicSemiconductor/nrfcloud-location-services-tests-js)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Tests the nRF Cloud Location services

- [LOCATE](https://api.feature.nrfcloud.com/v1#operation/LocateDevice)
- [AGPS](https://api.feature.nrfcloud.com/v1#operation/GetAssistanceData)
  (including message validation)
- [PGPS](https://api.feature.nrfcloud.com/v1#operation/GetPredictedAssistanceData)

Configure these environment variables:

- `API_HOST` (optional, endpoint to run the tests against)
- `TEAM_ID`
- `AGPS_SERVICE_KEY`
- `PGPS_SERVICE_KEY`
- `CELLGEO_SERVICE_KEY`

Then run:

    npm ci
    npm run test
