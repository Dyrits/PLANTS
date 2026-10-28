# Plants

A simple aggregator API retrieving plant data from the [Trefle API](https://trefle.io/), built as an assessment.

## About The Project

An Express API that aggregates plant data from the Trefle API, with Vitest tests and a Docker development setup.

### Built With

- Node.js + Express
- Vitest (tests)
- Docker Compose

## Getting Started

### Prerequisites

- Node.js, or Docker and Docker Compose
- A Trefle API token in `.env` (see `.env.example`: `API_TOKEN`, `PORT`)

### Installation

```sh
npm install
```

### Development

```sh
npm run watch        # node --watch src/index.js
npm test             # Vitest
```

Or with Docker:

```sh
make docker-watch    # build and run with compose watch
make docker-test     # run the Vitest suite inside the container
```

## License

No license file is present in this repository.

## Contact

Dyrits - https://github.com/Dyrits
