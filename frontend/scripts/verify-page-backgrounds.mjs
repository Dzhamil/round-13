import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const REQUIRED_BACKGROUNDS = [
    "about.png",
    "profile.png",
    "members.png",
    "trainings-schedule.png",
    "events.png",
    "shop.png",
    "merch.png",
    "requests.png",
    "rating-achievements.png",
    "boxer-potential.png",
    "schedule-2.png",
];

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(scriptsDirectory, "..");
const backgroundsDirectory = path.join(frontendDirectory, "public/images/page-backgrounds");

function readPngDimensions(buffer, filename) {
    const pngSignature = "89504e470d0a1a0a";
    if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
        throw new Error(`${filename} is not a valid PNG`);
    }

    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
    };
}

for (const filename of REQUIRED_BACKGROUNDS) {
    const image = await readFile(path.join(backgroundsDirectory, filename));
    const { width, height } = readPngDimensions(image, filename);
    if (width < 1920 || height < 1080) {
        throw new Error(`${filename} is ${width}x${height}; expected at least 1920x1080`);
    }
    console.log(`${filename}: ${width}x${height}`);
}

const homeStyles = await readFile(
    path.join(frontendDirectory, "src/pages/home/HomePage.module.css"),
    "utf8",
);
if (!homeStyles.includes('/images/round13-main-menu-background.png')) {
    throw new Error("HomePage must use round13-main-menu-background.png");
}
if (homeStyles.includes('/images/page-backgrounds/main-menu.png')) {
    throw new Error("HomePage must not use page-backgrounds/main-menu.png");
}

console.log("Home background mapping: OK");
