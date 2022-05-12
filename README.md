## Install the Substrate contracts node

To simplify this tutorial, you can [download](https://github.com/paritytech/substrate-contracts-node/releases) a precompiled Substrate node for Linux or macOS.The precompiled binary includes the FRAME pallet for smart contracts by default.
Alternatively, you can build the preconfigured `contracts-node` manually by running `cargo install contracts-node` on your local computer.

To install the contracts node on macOS or Linux:

1. Open the [Releases](https://github.com/paritytech/substrate-contracts-node/releases) page.

1. Download the appropriate compressed archive for your local computer.

1. Open the downloaded file and extract the contents to a working directory.

If you can't download the precompiled node, you can compile it locally with a command similar to the following:

```bash
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --tag <latest-tag> --force --locked
```

You can find the latest tag to use on the [Tags](https://github.com/paritytech/substrate-contracts-node/tags) page.

## Run a Substrate smart contracts node

If you have successfully installed [`substrate-contracts-node`](https://github.com/paritytech/substrate-contracts-node), you can start a local blockchain node for your smart contract.

To start the preconfigured `contracts-node`:

1. Open a terminal shell on your computer, if needed.

1. Start the contracts node in local development mode by running the following command:

    ```bash
    substrate-contracts-node --dev
    ```

    You should see output in the terminal and after a few seconds, you should see blocks being finalized.

    To interact with the blockchain, you need to connect to this node.
    You can connect to the node through a browser by opening the [Contracts UI](https://paritytech.github.io/contracts-ui).

1. Navigate to the [Contracts UI](https://paritytech.github.io/contracts-ui) in a web browser.

1. Select **Local Node**.

    ![Connect to local node](/assets/tutorials/ink-workshop/canvas-connect-to-local.png)

## Test the upgradable smart contract

If the dev node is running, open a second terminal shell.

Contracts abi/wasm has been pre-compiled, so no need to do this yourself.

Explore the test suite if necessary.

To run the test use the following command:

```bash
npm run test
```
