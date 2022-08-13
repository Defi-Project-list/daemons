# Daemons Contracts

Hereby you'll find all the contracts needed to run Daemons.

They will be divided in a few fundamental categories:

## Core

those contracts that constitute the infrastructure. Some examples are:

-   DaemonsToken
-   GasTank
-   Treasury
-   etc..

## Script infrastructure

the contracts needed to run the scripts, like:

-   Messages
-   ConditionsChecker
-   etc..

## Script executors

the contracts that are actually running the scripts. Each executor takes care of 1 action. They are:

-   TransferScriptExecutor
-   SwapperScriptExecutor
-   ZapInScriptExecutor
-   etc..