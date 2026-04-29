import fs from "fs";

const font = fs.readFileSync("./Roboto-Regular.ttf");
const base64 = font.toString("base64");

const output = `
const RobotoFont = "${base64}";
export default RobotoFont;
`;

fs.writeFileSync("./Roboto-Regular-normal.js", output);

console.log("✅ Convert font xong!");