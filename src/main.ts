import { on, showUI } from "@create-figma-plugin/utilities";

import { ResizeWindowHandler } from "./types";

export default function () {
  on<ResizeWindowHandler>(
    "RESIZE_WINDOW",
    function (windowSize: { width: number; height: number }) {
      const { width, height } = windowSize;
      figma.ui.resize(width, height);
    }
  );
  showUI({
    height: 600,
    width: 800,
  });

  figma.ui.onmessage = (msg) => {
    if (msg.type === "image") {
      figma
        .createImageAsync(msg.image)
        .then(async (image: Image) => {
          // Create node
          const frame = figma.createFrame();
          console.log(image)
          // Resize the node to match the image's width and height
          const { width, height } = await image.getSizeAsync();
          frame.resize(width, height);

          // Set the fill on the node
          frame.fills = [
            {
              type: "IMAGE",
              imageHash: image.hash,
              scaleMode: "FILL",
            },
          ];
        })
        .catch((error: any) => {
          console.log(error);
          figma.closePlugin();
        });
    }
  };
}
