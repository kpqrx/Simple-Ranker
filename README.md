# Simple Ranker

College credit project for _"Decisions support"_ (pl: Wspomaganie decyzji) subject at Poznan University of Technology.

## How to run the project

To run the project you need to have [Node JS](https://nodejs.org/en/download) and any package manager of choice installed. I used _npm_ (bundled into Node JS by default).

Please note, the project uses specific version of Node runtime (`.nvmrc`).

- To install all the dependencies:
  ```bash
  npm install
  ```
- To **compile** the project into executables:

  ```bash
  npm run compile
  ```

  The compiler will generate executables for Linux x64, MacOS x64 and Windows x64 platforms. Executables are present in the `/bin` directory.

  **Note**: Since compilation process requires compiler to embed the Node JS runtime into executable its size is aprox. 40MB depending on platform and it's the runtime mostly.

  It can be compressed even to half of the initial size with the use of [compression tools](https://github.com/upx/upx).

- To **start** the project in **development environment**:
  ```bash
  npm run start <input file path relative to project root>
  ```
- To **run the executable** you need to pass the input file path as the first (and only) execution argument like so:

  ```bash
  ./index-macos ../input.txt
  ```
