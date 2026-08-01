import { axe } from "vitest-axe";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import { toHaveNoA11yViolations } from "./toHaveNoA11yViolations";
import { toContainNoLaborData } from "./toContainNoLaborData";
import { toContainNoPersonalData } from "./toContainNoPersonalData";

expect.extend(matchers);
expect.extend({ toHaveNoA11yViolations, toContainNoLaborData, toContainNoPersonalData });

export { axe };
