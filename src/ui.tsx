import {
  render,
  useWindowResize,
  Container,
  Button,
  FileUploadButton,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useState } from "preact/hooks";
import { ResizeWindowHandler } from "./types";
import MapComponent from "./map";

import "!./styles.css";

function Plugin() {
  const [mapImage, setMapImage] = useState<string>("");
  const [uploads, setUploads] = useState<Array<File>>([]);
  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>("RESIZE_WINDOW", windowSize);
  }
  useWindowResize(onWindowResize, {
    maxHeight: 820,
    maxWidth: 820,
    minHeight: 400,
    minWidth: 600,
    resizeBehaviorOnDoubleClick: "minimize",
  });
  const acceptedFileTypes = ["application/json", "application/geojson"];

  return (
    <Container space="medium">
      <MapComponent setMapImage={setMapImage} uploads={uploads} />
      <FileUploadButton
        secondary
        acceptedFileTypes={acceptedFileTypes}
        id="upload"
        multiple
        onSelectedFiles={(files: Array<File>) => {
          setUploads(files);
        }}
      >
        Upload Data
      </FileUploadButton>
      <Button
        id="render"
        onClick={() =>
          parent.postMessage(
            { pluginMessage: { type: "image", image: mapImage } },
            "*"
          )
        }
      >
        Render
      </Button>
    </Container>
  );
}

export default render(Plugin);
