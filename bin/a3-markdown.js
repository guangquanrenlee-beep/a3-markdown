#!/usr/bin/env node
import { execute } from "../src/cli.js";

const code = await execute();
process.exit(code);
