import { readFileSync } from "fs";
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { CodePromise, ContractPromise } from '@polkadot/api-contract';

import {
    deployCodeContract,
    callMethod,
} from './helpers/test.utils.js';
import { expect } from 'chai';

const abiDelegator = JSON.parse(readFileSync("./contracts/delegate_calls_metadata.json"));
const abiFlipper = JSON.parse(readFileSync("./contracts/upgradable_flipper_metadata.json"));
const abiFlipperV2 = JSON.parse(readFileSync("./contracts/upgradable_flipper_v2_metadata.json"));

const contractDelegatorWasm = JSON.parse(readFileSync("./contracts/delegate_calls.json"));
const contractFlipperWasm = JSON.parse(readFileSync("./contracts/upgradable_flipper.json"));
const contractFlipperV2Wasm = JSON.parse(readFileSync("./contracts/upgradable_flipper_v2.json"));

describe('Upgradable Contract Test', function () {
    // Setup Variables
    let wsProvider;
    let api;
    let keyring;
    let alice;
    let gasLimit;
    let codeDelegator;
    let codeFlipper;
    let codeFlipperV2;
    let addressDelegator;
    let contractDelegatorUpgradable;
    let contractDelegator;
    let contractDelegatorV2;

    before(async function () {
        // Connect to local dev node
        wsProvider = new WsProvider('ws://127.0.0.01:9944');
        api = await ApiPromise.create({ provider: wsProvider });

        // Create a keyring instance
        keyring = new Keyring({ type: 'sr25519' });

        // Wait until api is ready
        await api.isReady;

        // Add our Alice dev account
        alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

        // Get the gas limit information
        const maxGasBlock = api.consts.system.blockWeights.maxBlock.toString();
        gasLimit = maxGasBlock / 2;

        // Instantiate code class for first deployment
        codeDelegator = new CodePromise(
            api,
            abiDelegator,
            contractDelegatorWasm.source.wasm
        );
        codeFlipper = new CodePromise(
            api,
            abiFlipper,
            contractFlipperWasm.source.wasm
        );
        codeFlipperV2 = new CodePromise(
            api,
            abiFlipperV2,
            contractFlipperV2Wasm.source.wasm
        );
    });

    describe('deployed default values should be correct', function () {
        before(async function () {
            // Deploy the first contract (flipper)
            await deployCodeContract(codeFlipper, alice, gasLimit, [false]);

            // Use the hash of deployed flipper in a constructor to delegator contract
            const res = await deployCodeContract(
                codeDelegator,
                alice,
                gasLimit,
                [abiFlipper.source.hash]
            );
            addressDelegator = res.contract.address.toString();
            // Create a contract object to update the hash stored within the delegator
            contractDelegatorUpgradable = new ContractPromise(
                api,
                abiDelegator,
                addressDelegator
            );
            // Create a contract object to interact with delegator, while using flipper ABI
            contractDelegator = new ContractPromise(
                api,
                abiFlipper,
                addressDelegator
            );
        });

        it('flip value should equal to false', async function () {
            const queryRes = await contractDelegator.query.get(alice.address, {
                value: 0,
                gasLimit: gasLimit,
            });

            expect(queryRes.output.toHuman()).to.eql(false);
        });
    });

    describe('delegated flip should work as expected', function () {
        it('flip value should equal to true', async function () {
            await callMethod(contractDelegator, 'flip', alice, 0, gasLimit);

            const queryRes = await contractDelegator.query.get(alice.address, {
                value: 0,
                gasLimit: gasLimit,
            });

            expect(queryRes.output.toHuman()).to.eql(true);
        });
    });

    describe('updated implementation should not affect state', function () {
        before(async function () {
            // Deploy the second version of flipper contract (it can also do some squaring)
            await deployCodeContract(codeFlipperV2, alice, gasLimit, [
                false,
                0,
            ]);

            // Create a contract object to interact with delegator, while using flipper ABI v2
            contractDelegatorV2 = new ContractPromise(
                api,
                abiFlipperV2,
                addressDelegator
            );

            // Upgate the delegate code hash
            await callMethod(
                contractDelegatorUpgradable,
                'changeDelegateCode',
                alice,
                0,
                gasLimit,
                [abiFlipperV2.source.hash]
            );
        });

        it('flip value should equal to true', async function () {
            const queryRes = await contractDelegatorV2.query.get(
                alice.address,
                {
                    value: 0,
                    gasLimit: gasLimit,
                }
            );

            expect(queryRes.output.toHuman()).to.eql(true);
        });
    });

    describe('new methods should work as expected', function () {
        it('square of 3 should equal 9', async function () {
            // Set the value to square
            await callMethod(contractDelegatorV2, 'set', alice, 0, gasLimit, [
                3,
            ]);
            // Call the square method
            await callMethod(contractDelegatorV2, 'square', alice, 0, gasLimit);

            const queryRes = await contractDelegatorV2.query.getSquare(
                alice.address,
                {
                    value: 0,
                    gasLimit: gasLimit,
                }
            );

            expect(queryRes.output.toHuman()).to.eql('9');
        });
    });

    after(async function () {
        await api.disconnect();
    });
});
