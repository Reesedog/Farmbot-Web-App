import { error } from "../../toast/toast";
import { toPairs } from "../../util";
import { t } from "../../i18next_wrapper";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { runFarmware, popUp } from "../../devices/actions";
import { TaggedWeedPointer } from "farmbot";
import { fakeResource } from "../../__test_support__/fake_resource";

export const scanImage = (coordScale: number) => (imageId: number) =>
  coordScale
    ? runFarmware("historical-plant-detection",
      toPairs({ PLANT_DETECTION_selected_image: "" + imageId }))
    : error(t("Calibrate camera first"));

export const detectPlants = (coordScale: number) => () =>
  coordScale
    ? runFarmware(FarmwareName.PlantDetection)
    : (makeFakeWeeds(), popUp("Weed Detection", "Successfully detected weeds, buy a device for more usages!"));


let weedPointersDemo: TaggedWeedPointer[] = []
export function makeFakeWeeds() {
  const numFakeWeeds = getRandomIntInclusive(1,3);
  const tpps : TaggedWeedPointer[] = []

  // add weeds into array
  for(let i=0; i<numFakeWeeds; i++) {
    tpps.push(fakeWeedDemo());
  }

  weedPointersDemo = tpps
}
export {weedPointersDemo}

// create fake weed
let idCounter = 1;
export function fakeWeedDemo(): TaggedWeedPointer {
  return fakeResource("Point", {
    id: idCounter++,
    name: "Weed"+idCounter.toString(),
    pointer_type: "Weed",
    x: getRandomIntInclusive(100, 900),
    y: getRandomIntInclusive(100, 900),
    z: 0,
    radius: getRandomIntInclusive(50, 100),
    plant_stage: "pending",
    meta: { created_by: "plant-detection", color: "red" }
  });
}

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function clearWeed() {
  // Get the number of weeds being cleared
  const numClearedWeeds = weedPointersDemo.length;

  // Clear the weedPointersDemo array by assigning it an empty array
  weedPointersDemo = [];

  // Show a pop-up message with the number of cleared weeds
  popUp("Weed Cleared", `Successfully cleared ${numClearedWeeds} weeds`);
}
  


