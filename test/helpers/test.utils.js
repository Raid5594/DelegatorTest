/* eslint-disable no-async-promise-executor */
async function deployCodeContract(code, signer, gasLimit, args) {
    return new Promise(async (resolve) => {
        await code.tx
            .new({ gasLimit, value: 0 }, ...args)
            .signAndSend(signer, (result) => {
                if (result.status.isInBlock || result.status.isFinalized) {
                    resolve(result);
                }
            });
    });
}

async function callMethod(contract, method, signer, value, gasLimit, args) {
    if (args === undefined) {
        return new Promise(async (resolve) => {
            await contract.tx[method]({ value, gasLimit }).signAndSend(
                signer,
                (result) => {
                    if (result.status.isInBlock) {
                        resolve(result);
                    } else if (result.status.isFinalized) {
                        resolve(result);
                    }
                }
            );
        });
    } else {
        return new Promise(async (resolve) => {
            await contract.tx[method]({ value, gasLimit }, ...args).signAndSend(
                signer,
                (result) => {
                    if (result.status.isInBlock) {
                        resolve(result);
                    } else if (result.status.isFinalized) {
                        resolve(result);
                    }
                }
            );
        });
    }
}

export { deployCodeContract, callMethod };
