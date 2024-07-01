import { success, info } from "../../toast/toast";
import { t } from "../../i18next_wrapper";

import {
	SpecialStatus,
	TaggedImage,
	TaggedWebcamFeed,
	Xyz,
} from "farmbot";
import cloneDeep from 'lodash/cloneDeep';
import { demoPhotos, demoPresentPhotos } from "./demo_photos";
import { createAdOnce } from "../../toast/toast_internal_support";
import { adMessages } from "./demo_ads";

// a sample webcam feed for demo
export const demoWebcamFeed: TaggedWebcamFeed = {
	kind: "WebcamFeed",
	specialStatus: SpecialStatus.SAVED,
	body: {
		url: "http://89.26.84.194:5661/mjpg/video.mjpg",
		name: "demoWebcamFeed",
	},
	uuid: "demoWebcamFeed"
}

// a local representation of the current status of position
export const demoPos: Record<Xyz, number | undefined> = {
	x: 0,
	y: 0,
	z: 0,
};

// limitation of the sample farmbot map
// fixed incorrect y limitation
export const map_limit = {
	x: 2900,
	y: 1200,
	z: 400,
};

// a sample of images for demo
export var demoImages: TaggedImage[] = demoPhotos;

export var demoCurrentImage: TaggedImage | undefined = demoImages[0];
export function setCurrentImage(image: TaggedImage) {
	demoCurrentImage = image;
}

// take photo of current position of FarmBot. 
export function demoTakePhoto(): void {
	maybePopupAd();
	if (isComparing) {
		info(t("Unable to take photos while comparing"));
		return;
	}

	// get image of current position. 
	const id: number = Math.floor(((demoPos.x || 0) + 150) / 400) * 3 + Math.floor(((demoPos.y || 0) + 100) / 400) + 1;
	const image = demoPresentPhotos[id - 1];
	// get and format current time. 
	const currentTime = new Date();
	const formattedTime = `${currentTime.getFullYear()}-` +
		`${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-` +
		`${(currentTime.getDate()).toString().padStart(2, '0')}` +
		`T${currentTime.toLocaleTimeString()}`;
	// set current time for the image taken. 
	image.body.created_at = formattedTime;
	// push the image to the head of demoImages. 
	demoImages.unshift(cloneDeep(image));
	// set image as current image. 
	demoCurrentImage = demoImages[0];
	success(t("Photo Taken"));
}

// delete current photo in flipper
export function demoDeletePhoto(): void {
	maybePopupAd();
	if (isComparing) {
		info(t("Unable to delete photos while comparing"));
		return;
	}

	if (demoCurrentImage) {
		// get the index of current image. 
		const i: number = demoImages.indexOf(demoCurrentImage);
		// remove current image. 
		demoImages.splice(i, 1);
		// set next current image. 
		if (demoImages.length > 0) {
			demoCurrentImage = i < demoImages.length ? demoImages[i] : demoImages[i - 1];
		} else {
			demoCurrentImage = undefined;
		}
		success(t("Image Deleted."));
	}
}

// rotate current photo in flipper
export var currentRotation: number = 0;
export function demoToggleRotation(): void { currentRotation = (currentRotation + 90) % 360 }

// placeholder for crop current photo
export function demoToggleCrop(): void { info(t("Sorry, demo account does not support crop photos")) }

// render the time line label of photos in flipper
export const demoRenderLabel = (value: number) => {
	if (value == compareList.length - 1) { return t("newest"); }
	if (value == 0) { return t("oldest"); }
	return "";
}
// calculate the index of image in time line. 
export const demoGetImageIndex = (image: TaggedImage | undefined): number => {
	if (image) { return compareList.length - 1 - compareList.indexOf(image) }
	else { return 0 }
}

/** Compare Logic */
// flag to check if comparing photos
export var isComparing: boolean = false
export var compareList: TaggedImage[] = [];
function getCompareList(): TaggedImage[] {
	const currentX: number = demoCurrentImage?.body.meta.x || -1;
	const currentY: number = demoCurrentImage?.body.meta.y || -1;
	return demoImages.filter((image) =>
		(image.body.meta.x == currentX) && (image.body.meta.y == currentY))
}
// Function to swith between normal mode and comparing mode. 
export function demoCompare() {
	maybePopupAd();
	if (isComparing) {
		info(t("Comparing mode exited"));
		isComparing = false;
	} else {
		compareList = getCompareList();
		if (compareList.length > 1) {
			isComparing = true;
			info(t("In comparing mode, flip over photos to compare! Click again to exit."));
		} else {
			info(t("No photo to compare for current image. Take photo to compare!"));
		}
	}
}

// check if the state of 'image_flipper' is updated. 
export var demoLabel = true;
export function setLabel(label: boolean) {
	demoLabel = label;
}
export var prevImages = cloneDeep(demoImages);
export var prevI = -1;
export function setPrevI(i: number) { prevI = i }
export function checkUpdate() {
	if (prevImages.length != demoImages.length) {
		prevImages = cloneDeep(demoImages);
		return true;
	} else {
		return false;
	}
}

export const ad_counter = {
	count: 1,
	// present ver ad
	POPUP: 20,
	adCount: 0,
};

// pop up ad function
// when some components are accessed for a certain times
// display ad
export function maybePopupAd() {
	if (ad_counter.count != null && ad_counter.POPUP != null && ad_counter.adCount != null) {
		if (ad_counter.count >= ad_counter.POPUP) {
			// rotate through different ads 
			createAdOnce(adMessages[ad_counter.adCount]);
			ad_counter.count = 0;
			ad_counter.adCount += 1;
			if (ad_counter.adCount >= adMessages.length)
				ad_counter.adCount = 0;
		}
	}
	ad_counter.count += 1;
}
