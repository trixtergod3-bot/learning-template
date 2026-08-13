# ADR 0003: Generated activities are deterministic and versioned

**Status:** Accepted for Phase 1

## Context

Generated practice is central to mathematics and useful in other subjects. Unseeded generation makes
failed items hard to reproduce, telemetry ambiguous, and daily or competitive sets unfair.

## Decision

Register generators by stable ID and version. Validate configuration at runtime. Derive randomness
from a recorded seed, sequence number, and generator identity. Generator code must be pure with
respect to network, storage, and wall-clock time.

## Consequences

- Items are replayable for tests, explanations, and audit.
- Generator versions remain available while historical attempts refer to them.
- Course authors must design explicit version and retirement policies.
- Large-scale trusted validation remains a Phase 2+ architecture decision.
