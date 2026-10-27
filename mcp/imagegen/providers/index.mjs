import * as fal from "./fal.mjs";
import * as bfl from "./bfl.mjs";
import * as google from "./google.mjs";
import * as openai from "./openai.mjs";
import * as ideogram from "./ideogram.mjs";
import * as replicate from "./replicate.mjs";
import * as comfyui from "./comfyui.mjs";
import * as pollinations from "./pollinations.mjs";

export const providers = {
  fal,
  bfl,
  google,
  openai,
  ideogram,
  replicate,
  comfyui,
  pollinations,
};

export function getProvider(id) {
  return providers[id] ?? null;
}
