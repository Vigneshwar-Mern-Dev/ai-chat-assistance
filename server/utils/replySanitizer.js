const unsafeAiPhrases = [
  "as an ai",
  "i am an ai",
  "i'm an ai",
  "as a language model",
  "i cannot reply as a real person"
];

function stripWrappingQuotes(value) {
  return value.replace(/^["'`]+|["'`]+$/g, "").trim();
}

function sanitizeReplyText(value, { maxLength = 700 } = {}) {
  let output = String(value || "")
    .replace(/\r/g, "")
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .trim();

  output = stripWrappingQuotes(output);

  for (let index = 0; index < 3; index += 1) {
    output = output.replace(/^(assistant|ai|bot|reply|me|vignesh)\s*:\s*/i, "").trim();
  }

  output = stripWrappingQuotes(output);

  output = output
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const normalizedOutput = output.toLowerCase();

  if (unsafeAiPhrases.some((phrase) => normalizedOutput.includes(phrase))) {
    throw new Error("AI reply failed safety check");
  }

  if (output.length > maxLength) {
    output = output.slice(0, maxLength).trim();
  }

  if (!output) {
    throw new Error("AI reply was empty after cleanup");
  }

  return output;
}

module.exports = {
  sanitizeReplyText
};
