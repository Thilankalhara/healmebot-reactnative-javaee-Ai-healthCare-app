// utils/validation.ts
export interface InputData {
  age: string;
  height: string;
  weight: string;
  issues?: string;
}

export function validateInputs({ age, height, weight, issues }: InputData) {
  if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120)
    return { ok: false, message: "Enter a valid age (1–120)" };
  if (!height || isNaN(Number(height)) || Number(height) <= 30 || Number(height) > 300)
    return { ok: false, message: "Enter a valid height (cm)" };
  if (!weight || isNaN(Number(weight)) || Number(weight) <= 1 || Number(weight) > 500)
    return { ok: false, message: "Enter a valid weight (kg)" };
  if (issues && issues.length > 500)
    return { ok: false, message: "Health issues text too long" };
  return { ok: true };
}
